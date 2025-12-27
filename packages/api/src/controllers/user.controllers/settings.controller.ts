import { Hono } from "hono";
import { auth } from "../../auth";
import { uploadProfileImage } from "../../utils/upload-image";
import { prisma } from "@repo/db";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";

const SettingsController = new Hono<{
    Variables: {
        user: typeof auth.$Infer.Session.user | null;
        session: typeof auth.$Infer.Session.session | null;
        userId: string;
    };
}>()
    .post(
        "/upload-image",
        zValidator("json", z.object({ image: z.string() })),
        async (c) => {
            console.log("Image Uploader is called")
            const { image } = c.req.valid("json");
            const userId = c.get("userId");
            console.log("user id is", userId)
            if (!userId) return c.json({ error: "Unauthorized" }, 401);

            try {
                const result = await uploadProfileImage(image, userId);
                console.log("url profile image", result.secure_url)

                // Update user in DB
                await prisma.user.update({
                    where: { id: userId },
                    data: { image: result.secure_url },
                });

                return c.json({ success: true, url: result.secure_url });
            } catch (e: any) {
                return c.json({ success: false, error: e.message }, 500);
            }
        },
    )
    .patch(
        "/profile",
        zValidator("json", z.object({ name: z.string().optional() })),
        async (c) => {
            const { name } = c.req.valid("json");
            const userId = c.get("userId");
            if (!userId) return c.json({ error: "Unauthorized" }, 401);

            await prisma.user.update({
                where: { id: userId },
                data: { ...(name && { name }) },
            });
            return c.json({ success: true });
        },
    );

export default SettingsController;
