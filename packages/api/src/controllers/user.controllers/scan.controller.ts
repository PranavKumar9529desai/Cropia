import { Hono } from "hono";
import { auth } from "../../auth";
import { prisma } from "@repo/db";

const ScanController = new Hono<{
    Variables: {
        user: typeof auth.$Infer.Session.user | null;
        session: typeof auth.$Infer.Session.session | null;
        userId: string;
    };
}>()
    .get("/", async (c) => {
        const userId = c.get("userId");
        if (!userId) {
            return c.json({ success: false, error: "Unauthorized" }, 401);
        }

        try {
            const scans = await prisma.scan.findMany({
                where: { userId },
                orderBy: { createdAt: "desc" },
                select: {
                    id: true,
                    imageUrl: true,
                    crop: true,
                    diagnosis: true,
                    visualSeverity: true,
                    confidence: true,
                    createdAt: true,
                }
            });

            return c.json({ success: true, data: scans });
        } catch (error) {
            console.error("Error fetching scans:", error);
            return c.json({ success: false, error: "Failed to fetch scans" }, 500);
        }
    })
    .delete("/:id", async (c) => {
        const userId = c.get("userId");
        const scanId = c.req.param("id");

        if (!userId) {
            return c.json({ success: false, error: "Unauthorized" }, 401);
        }

        try {
            // Ensure the scan belongs to the user
            const scan = await prisma.scan.findUnique({
                where: { id: scanId },
            });

            if (!scan) {
                return c.json({ success: false, error: "Scan not found" }, 404);
            }

            if (scan.userId !== userId) {
                return c.json({ success: false, error: "Forbidden" }, 403);
            }

            await prisma.scan.delete({
                where: { id: scanId },
            });

            return c.json({ success: true, message: "Scan deleted successfully" });
        } catch (error) {
            console.error("Error deleting scan:", error);
            return c.json({ success: false, error: "Failed to delete scan" }, 500);
        }
    });

export default ScanController;
