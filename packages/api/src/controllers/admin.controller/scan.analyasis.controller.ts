import { Hono } from "hono";
import prisma, { Jurisdiction } from "@repo/db";
import { auth } from "../../auth";
import { runScanAnalysis } from "../../utils/agents/analyasis-agent";
import { getJurisdictionFilter } from "../../utils/jurisdiction";

export const ScanAnalyasisController = new Hono<{
  Variables: {
    user: typeof auth.$Infer.Session.user;
    session: typeof auth.$Infer.Session.session;
    userId: string;
    orgId: string;
    jurisdiction: Jurisdiction;
  };
}>()
  .get("/", async (c) => {
    console.log("scan analyasis is called");
    const jurisdiction = c.get("jurisdiction");
    const orgId = c.get("orgId");

    // For analysis, we look for records matching the exact jurisdiction level
    // If a field is "All", the record should have it as null in DB
    const analysisWhere: any = { organizationId: orgId };
    ["state", "district", "taluka"].forEach((level) => {
      const value = (jurisdiction as any)[level];
      analysisWhere[level] = value === "All" ? null : value;
    });

    const analysis = await prisma.agentScanAnalysis.findFirst({
      where: analysisWhere,
      orderBy: {
        createdAt: "desc",
      },
    });
    console.log("analysis", analysis);
    c.header("Cache-Control", "public, max-age=3600"); // 1 hour

    return c.json(analysis);
  })
  .post("/run", async (c) => {
    const jurisdiction = c.get("jurisdiction");
    const orgId = c.get("orgId");

    try {
      // 1. Run the agent
      const result = await runScanAnalysis(jurisdiction);
      console.log("result", result);
      // 2. Count current scans for record keeping
      const scanCount = await prisma.scan.count({
        where: getJurisdictionFilter(jurisdiction),
      });

      // 3. Save to DB
      const savedAnalysis = await prisma.agentScanAnalysis.create({
        data: {
          organizationId: orgId,
          state: jurisdiction.state === "All" ? null : jurisdiction.state,
          district:
            jurisdiction.district === "All" ? null : jurisdiction.district,
          taluka: jurisdiction.taluka === "All" ? null : jurisdiction.taluka,
          headlines: result.headlines,
          stats: {
            diseaseDistribution: result.stats.diseaseDistribution,
            totalScansAnalyzed: result.stats.totalScansAnalyzed,
            avgConfidence: result.stats.avgConfidence,
          },
          lastScanCount: scanCount,
          lastProcessedAt: new Date(),
        },
      });

      const addAnlaysisToOrganization = await prisma.organization.update({
        where: {
          id: orgId,
        },
        data: {
          agentScanAnalyses: {
            connect: {
              id: savedAnalysis.id,
            },
          },
        },
      });

      return c.json({ success: true, analysis: savedAnalysis });
    } catch (error) {
      console.error("Failed to run analysis:", error);
      return c.json({ success: false, error: "Failed to run analysis" }, 500);
    }
  });
