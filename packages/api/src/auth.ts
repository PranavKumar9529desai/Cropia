import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import prisma, { User, Session as PrismaSession, Invitation } from "@repo/db";
import { openAPI, organization } from "better-auth/plugins";
import { transporter } from "@repo/api/utils/email";

const SENDER_EMAIL = `"Cropia Team" <${process.env.GMAIL_USER}>`;
// as the admin is invite only, we use the farmer app url for both admin and farmer
const frontendUrl = process.env.FRONTEND_URL_FARMER_APP || "http://localhost:5000";

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:4000",
  trustedOrigins: [
    process.env.FRONTEND_URL_FARMER_APP || "http://localhost:5000",
    process.env.FRONTEND_URL_ADMIN_APP || "http://localhost:5001",
  ].filter(Boolean) as string[],

  database: prismaAdapter(prisma, {
    provider: "mongodb",
  }),

  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
  },

  emailAndPassword: {
    enabled: true,
    async sendResetPassword({ user, url, token }) {
      const resetLink = `${frontendUrl}/reset-password?token=${token || url.split("=")[1]}`;
      await transporter.sendMail({
        from: SENDER_EMAIL,
        to: user.email,
        subject: "Reset your Cropia password",
        html: `<p>Click the link below to reset your password:</p><a href="${resetLink}">Reset Password</a>`,
      });
    },
  },

  emailVerification: {
    autoSignInAfterVerification: true,
    async sendVerificationEmail({ user, url, token }) {
      const verifyLink = `${frontendUrl}/verify-email?token=${token || url.split("=")[1]}`;
      await transporter.sendMail({
        from: SENDER_EMAIL,
        to: user.email,
        subject: "Verify your email for Cropia",
        html: `<a href="${verifyLink}">Verify Email</a>`,
      });
    },
  },

  session: {
    additionalFields: {
      jurisdiction: {
        type: "json",
        required: false,
      },
    },
  },

  plugins: [
    openAPI(),
    organization({
      // v1.4.0: Automatically activates the first organization for the user
      autoSetOrganization: true,
      schema: {
        invitation: {
          additionalFields: {
            jurisdiction: { type: "json", required: false, input: true },
          },
        },
        member: {
          additionalFields: {
            jurisdiction: { type: "json", required: false, input: true },
          },
        },
      },
      organizationHooks: {
        /**
         * Runs after an admin accepts an invitation.
         * Since ctx.session can be unreliable during signup, we find the session row manually.
         */
        afterAcceptInvitation: async ({
          invitation,
          user,
        }: {
          invitation: Invitation;
          user: User;
        }) => {
          console.log("🚀 CROPIA: Invite accepted for:", user.email);

          if (invitation && invitation.jurisdiction) {
            try {
              // 1. Permanently update the Member record
              await prisma.member.updateMany({
                where: {
                  userId: user.id,
                  organizationId: invitation.organizationId,
                },
                data: {
                  jurisdiction: invitation.jurisdiction,
                },
              });

              // 2. Find the user's latest session row and update it
              const latestSession = await prisma.session.findFirst({
                where: { userId: user.id },
                orderBy: { createdAt: "desc" },
              });

              if (latestSession) {
                await prisma.session.update({
                  where: { id: latestSession.id },
                  data: {
                    activeOrganizationId: invitation.organizationId,
                    jurisdiction: invitation.jurisdiction as any,
                  },
                });
                console.log("✅ Live Session row updated with Jurisdiction.");
              }
            } catch (e) {
              console.error("❌ Sync Error in afterAcceptInvitation:", e);
            }
          }
        },
      } as any,
      async sendInvitationEmail(data) {
        const inviteLink = `${process.env.FRONTEND_URL_ADMIN_APP || "http://localhost:5001"}/accept-invitation/${data.id}`;
        await transporter.sendMail({
          from: SENDER_EMAIL,
          to: data.email,
          subject: "Join the Cropia Team",
          html: `<h1>Welcome!</h1><p>Join <b>${data.organization.name}</b>.</p><a href="${inviteLink}">Accept Invitation</a>`,
        });
      },
    }),
  ],

  /**
   * Database Hooks: Ensures every new login/session is correctly scoped to the
   * Admin's organization and jurisdiction.
   */
  databaseHooks: {
    session: {
      create: {
        before: async (session: PrismaSession) => {
          const member = await prisma.member.findFirst({
            where: { userId: session.userId },
            select: { organizationId: true, jurisdiction: true },
          });

          if (member) {
            console.log(
              "🛠️ DB HOOK: Injecting Active Org into new session row.",
            );
            return {
              data: {
                ...session,
                activeOrganizationId: member.organizationId,
                jurisdiction: member.jurisdiction || null,
              },
            };
          }
          return { data: session };
        },
      },
    },
  } as any,

  callbacks: {
    async session({ session, user }: { session: PrismaSession; user: User }) {
      // NOTE: To see these logs, perform a HARD REFRESH (Ctrl + F5)
      // This bypasses the browser's cookie cache.
      console.log("📡 CALLBACK: Hydrating session response for", user.email);

      const activeOrgId = session.activeOrganizationId;

      // Ensure the response object matches the database source of truth
      const member = await prisma.member.findFirst({
        where: {
          userId: user.id,
          organizationId: activeOrgId || undefined,
        },
        select: { jurisdiction: true, organizationId: true },
      });

      return {
        session: {
          ...session,
          activeOrganizationId: activeOrgId || member?.organizationId || null,
          jurisdiction: session.jurisdiction || member?.jurisdiction || null,
        },
        user,
      };
    },
  },
});
