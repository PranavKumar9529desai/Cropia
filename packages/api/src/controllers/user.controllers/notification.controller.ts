import { Hono } from "hono";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import { prisma } from "@repo/db";
import type { auth } from "../../auth";
import { getFirebaseMessaging } from "../../lib/firebase";

const NotificationController = new Hono<{
  Variables: {
    user: typeof auth.$Infer.Session.user | null;
    session: typeof auth.$Infer.Session.session | null;
  };
}>()
  .post(
    "/register-device",
    zValidator(
      "json",
      z.object({
        token: z.string(),
        platform: z.enum(["android", "ios", "web"]).optional(),
      }),
    ),
    async (c) => {
      const { token, platform } = c.req.valid("json");
      const user = c.get("user"); // Provided by UserSessionMiddleware

      if (!user) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      try {
        // Upsert device to ensure token is unique and linked to current user
        // If token exists, update user and timestamp
        await prisma.device.upsert({
          where: { token },
          update: {
            userId: user.id,
            platform,
          },
          create: {
            token,
            platform,
            userId: user.id,
          },
        });

        // Subscribe to 'all' topic for broadcasts
        await getFirebaseMessaging().subscribeToTopic(token, "all");

        return c.json({ success: true });
      } catch (error) {
        console.error("Error registering device:", error);
        return c.json({ error: "Internal Server Error" }, 500);
      }
    },
  )
  .get("/", async (c) => {
    const user = c.get("user");
    if (!user) return c.json({ error: "Unauthorized" }, 401);

    try {
      const notifications = await prisma.notification.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: "desc" },
        take: 50, // Limit to last 50 for now
      });
      return c.json({ notifications });
    } catch (error) {
      console.error("Error fetching notifications:", error);
      return c.json({ error: "Internal Server Error" }, 500);
    }
  })
  .get("/unread-count", async (c) => {
    const user = c.get("user");
    if (!user) return c.json({ error: "Unauthorized" }, 401);

    try {
      const count = await prisma.notification.count({
        where: { userId: user.id, seen: false },
      });
      return c.json({ count });
    } catch (error) {
      console.error("Error fetching unread count:", error);
      return c.json({ error: "Internal Server Error" }, 500);
    }
  })
  .post(
    "/mark-seen",
    zValidator(
      "json",
      z.object({
        notificationId: z.string().optional(), // If provided, mark single, else mark all
      }),
    ),
    async (c) => {
      const user = c.get("user");
      if (!user) return c.json({ error: "Unauthorized" }, 401);

      const { notificationId } = c.req.valid("json");

      try {
        if (notificationId) {
          await prisma.notification.update({
            where: { id: notificationId, userId: user.id },
            data: { seen: true },
          });
        } else {
          await prisma.notification.updateMany({
            where: { userId: user.id, seen: false },
            data: { seen: true },
          });
        }
        return c.json({ success: true });
      } catch (error) {
        console.error("Error marking notification as seen:", error);
        return c.json({ error: "Internal Server Error" }, 500);
      }
    },
  );

export default NotificationController;
