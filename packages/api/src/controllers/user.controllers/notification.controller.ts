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
            })
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
        }
    );

export default NotificationController;
