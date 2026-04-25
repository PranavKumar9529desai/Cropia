import { Hono } from "hono";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import { Jurisdiction, prisma } from "@repo/db";
import { getFirebaseMessaging } from "../../lib/firebase";
import type { auth } from "../../auth";

const AdminNotificationController = new Hono<{
  Variables: {
    user: typeof auth.$Infer.Session.user;
    session: typeof auth.$Infer.Session.session;
    userId: string;
    orgId: string;
    jurisdiction: Jurisdiction;
  };
}>().post(
  "/send",
  zValidator(
    "json",
    z.object({
      userId: z.string().optional(),
      topic: z.string().optional(),
      title: z.string(),
      body: z.string(),
      imageUrl: z.string().optional(),
      data: z.record(z.string(), z.string()).optional(),
    }),
  ),
  async (c) => {
    const payload = c.req.valid("json");
    const { userId, topic, title, body, imageUrl } = payload;
    const data = payload.data as Record<string, string> | undefined;
    const messaging = getFirebaseMessaging();

    const adminUser = c.get("user");
    const jurisdiction = c.get("jurisdiction") as Jurisdiction;

    // Fetch organization name if possible
    const member = await prisma.member.findFirst({
      where: { userId: adminUser.id },
      include: { organization: { select: { name: true } } },
    });

    const from = {
      name: adminUser.name || "Admin",
      organizationName: member?.organization?.name || "Cropia",
      jurisdiction: jurisdiction?.taluka || null,
    };

    try {
      if (userId) {
        // Send to specific user
        const devices = await prisma.device.findMany({
          where: { userId },
          select: { token: true },
        });

        if (devices.length === 0) {
          return c.json({ message: "No devices found for user" }, 404);
        }

        const tokens = devices.map((d) => d.token);

        const response = await messaging.sendEachForMulticast({
          tokens,
          notification: {
            title,
            body,
            imageUrl,
          },
          data: data || {},
        });

        // Save notification to DB for the user
        await prisma.notification.create({
          data: {
            userId,
            title,
            body,
            imageUrl,
            from,
          },
        });

        // Cleanup invalid tokens
        if (response.failureCount > 0) {
          const failedTokens: string[] = [];
          response.responses.forEach((resp, idx) => {
            if (!resp.success) {
              failedTokens.push(tokens[idx]);
            }
          });
          // Delete failed tokens
          if (failedTokens.length > 0) {
            await prisma.device.deleteMany({
              where: { token: { in: failedTokens } },
            });
          }
        }

        return c.json({
          success: true,
          successCount: response.successCount,
          failureCount: response.failureCount,
        });
      } else if (topic) {
        // Send to topic
        await messaging.send({
          topic,
          notification: {
            title,
            body,
            imageUrl,
          },
          data: data || {},
        });

        // If topic is 'all', broadcast to appropriate users
        // Cascading jurisdiction: taluka → district → state
        if (topic === "all") {
          let users: { id: string }[] = [];

          if (jurisdiction) {
            const { taluka, district, state } = jurisdiction;

            // 1. Try taluka-level (most specific)
            if (taluka && taluka !== "All") {
              users = await prisma.user.findMany({
                where: { location: { taluka } },
                select: { id: true },
              });
            }

            // 2. Escalate to district if no users found at taluka level
            if (users.length === 0 && district && district !== "All") {
              users = await prisma.user.findMany({
                where: { location: { district } },
                select: { id: true },
              });
            }

            // 3. Escalate to state if no users found at district level
            if (users.length === 0 && state) {
              users = await prisma.user.findMany({
                where: { location: { state } },
                select: { id: true },
              });
            }
          } else {
            // No jurisdiction — broadcast to all users
            users = await prisma.user.findMany({
              select: { id: true },
            });
          }

          if (users.length > 0) {
            await prisma.notification.createMany({
              data: users.map((user) => ({
                userId: user.id,
                title,
                body,
                imageUrl,
                from,
              })),
            });
          }
        }

        return c.json({ success: true, message: "Sent to topic" });
      } else {
        return c.json({ error: "Either userId or topic is required" }, 400);
      }
    } catch (error) {
      console.error("Error sending notification:", error);
      return c.json({ error: "Failed to send notification" }, 500);
    }
  },
);

export default AdminNotificationController;
