import { Hono } from "hono";
import prisma, { Jurisdiction } from "@repo/db";
import { auth } from "../../auth";
import { transformToGeoJSON } from "../../utils/scan.helpers";
import { getJurisdictionFilter } from "../../utils/jurisdiction";

const MapController = new Hono<{
  Variables: {
    user: typeof auth.$Infer.Session.user;
    session: typeof auth.$Infer.Session.session;
    userId: string;
    orgId: string;
    jurisdiction: Jurisdiction;
  };
}>().get("/scans", async (c) => {
  const jurisdiction = c.get("jurisdiction");

  // 1. Build Dynamic Filter based on Jurisdiction
  const where = getJurisdictionFilter(jurisdiction);

  // 2. Fetch Scans
  // TODO : add nice caching here
  const scans = await prisma.scan.findMany({
    where: where,
    orderBy: { createdAt: "desc" },
    take: 1000, // Limit for performance, maybe paginate later
  });
  console.log("scans", scans);
  // 3. Format for MapLibre
  const geoJson = transformToGeoJSON(scans);

  return c.json(geoJson);
});

export default MapController;
