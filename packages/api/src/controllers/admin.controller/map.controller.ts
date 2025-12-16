import { Hono } from "hono";
import prisma, { Jurisdiction } from "@repo/db";
import { auth } from "../../auth";
import { transformToGeoJSON } from "../../utils/scan.helpers";

const MapController = new Hono<{
    Variables: {
        user: typeof auth.$Infer.Session.user;
        session: typeof auth.$Infer.Session.session;
        userId: string;
        orgId: string;
        jurisdiction: Jurisdiction;
    }
}>()
    .get("/scans", async (c) => {
        const jurisdiction = c.get("jurisdiction");

        // 1. Build Dynamic Filter based on Jurisdiction
        const where: any = {};

        // Iterate through the hierarchy levels
        const levels = ["state", "district", "taluka", "village"] as const;

        if (jurisdiction) {
            levels.forEach((level) => {
                const value = jurisdiction[level];
                // If it's specific (not "All" and not "*"), filter by it
                if (value && value !== "All" && value !== "*") {
                    where[level] = value;
                }
            });
        }

        // 2. Fetch Scans
        const scans = await prisma.scan.findMany({
            where: where,
            orderBy: { createdAt: 'desc' },
            take: 1000 // Limit for performance, maybe paginate later
        });

        // 3. Format for MapLibre
        const geoJson = transformToGeoJSON(scans);

        return c.json(geoJson);
    })


export default MapController