import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import prisma, { User, Session as PrismaSession } from "@repo/db";
import { openAPI, organization } from "better-auth/plugins";
import { transporter } from "./utils/email";

// Define sender once
const SENDER_EMAIL = `"Cropia Team" <${process.env.GMAIL_USER}>`;
const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5000";

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:4000",
  trustedOrigins: [
    // later we should single source of truth  
    // ths is only for the development
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

  plugins: [
    openAPI(),
    organization({
      // FIXED: 'data' IS the invitation object. It does not contain a nested 'invitation' property.
      async sendInvitationEmail(data) {
        // use admin_ulr and invite is for the admin

        const inviteLink = `${process.env.FRONTEND_URL_ADMIN_APP || "http://localhost:5001"}/accept-invitation/${data.id}`;

        await transporter.sendMail({
          from: SENDER_EMAIL,
          to: data.email,
          subject: "You've been invited to join a Cropia Organization",
          html: `
            <h1>Welcome to the team!</h1>
            <p>You have been invited to join the organization <b>${data.organization.name}</b>.</p>
            <p>Click the link below to accept the invitation:</p>
            <a href="${inviteLink}">Accept Invitation</a>
          `,
        });
      },
    }),
  ],

  emailAndPassword: {
    enabled: true,
    // FIXED: The first argument is the 'user' object directly. It is NOT wrapped in another 'user' property.
    async sendResetPassword({ user, url, token }) {
      const resetLink = `${frontendUrl}/reset-password?token=${token || url.split("=")[1]}`;
      await transporter.sendMail({
        from: SENDER_EMAIL,
        to: user.email, // <--- Fixed: was user.user.email
        subject: "Reset your Cropia password",
        html: `
          <p>Click the link below to reset your password:</p>
          <a href="${resetLink}">Reset Password</a>
        `,
      });
    },
  },
  emailVerification: {
    enabled: true, // 1. Explicitly set to true
    sendOnSignUp: true, // 2. Send email on sign up
    autoSignInAfterVerification: true,
    // 2. FIXED NAME: Changed from 'sendEmailVerification' to 'sendVerificationEmail'
    async sendVerificationEmail({ user, url, token }) {
      const verifyLink = `${frontendUrl}/verify-email?token=${token || url.split("=")[1]}`;

      await transporter.sendMail({
        from: SENDER_EMAIL,
        to: user.email,
        subject: "Verify your email for Cropia",
        html: `
          <h1>Welcome, ${user.name}!</h1>
          <p>Please verify your email address to activate your account.</p>
          <a href="${verifyLink}">Verify Email</a>
        `,
      });
    },
  },
  databaseHooks: {
    member: {
      create: {
        before: async (member: any) => {
          // 1. We need the user's email to find the invitation
          const user = await prisma.user.findUnique({
            where: { id: member.userId },
            select: { email: true }
          });

          if (!user) return member;

          // 2. Find the pending invitation
          const invitation = await prisma.invitation.findFirst({
            where: {
              email: user.email,
              organizationId: member.organizationId,
            },
            select: {
              jurisdiction: true
            }
          });

          // 3. If invitation has jurisdiction, attached it to the new member
          if (invitation && invitation.jurisdiction) {
            return {
              ...member,
              jurisdiction: invitation.jurisdiction
            }
          }

          return member;
        }
      }
    },
    session: {
      create: {
        after: async (session) => {
          // This runs after session creation if needed, but we need read/get
        }
      }
    }
  },
  callbacks: {
    async session(session: { session: PrismaSession; user: User }, request: any) {
      console.log("---------- SESSION CALLBACK START ----------");
      console.log("Original Session activeOrgId:", session.session.activeOrganizationId);
      console.log("User ID:", session.user.id);

      let member;

      if (session.session.activeOrganizationId) {
        console.log("Searching by Org + User");
        member = await prisma.member.findFirst({
          where: {
            organizationId: session.session.activeOrganizationId,
            userId: session.user.id
          },
          select: {
            jurisdiction: true
          }
        });
      } else {
        console.log("Searching by User Only (Fallback)");
        // Fallback: If no active org, try to find *any* membership (matching AdminSessionMiddleware behavior)
        member = await prisma.member.findFirst({
          where: {
            userId: session.user.id
          },
          select: {
            jurisdiction: true
          }
        });
      }

      console.log("Found Member:", member);

      const newSession = {
        ...session,
        session: {
          ...session.session,
          jurisdiction: member?.jurisdiction || null
        }
      };

      console.log("Returning Session with Jurisdiction:", newSession.session.jurisdiction);
      console.log("---------- SESSION CALLBACK END ----------");

      return newSession;
    }
  }
});
