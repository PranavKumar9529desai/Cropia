import { Hono } from "hono";
import prisma, { Jurisdiction } from "@repo/db";
import { auth } from "../../auth";
import { runScanAnalysis } from "../../utils/agents/analyasis-agent";

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
        const jurisdiction = c.get("jurisdiction");
        const orgId = c.get("orgId");

        const analysis = await prisma.agentScanAnalysis.findFirst({
            where: {
                organizationId: orgId,
                state: jurisdiction.state === "All" ? null : jurisdiction.state,
                district: jurisdiction.district === "All" ? null : jurisdiction.district,
                taluka: jurisdiction.taluka === "All" ? null : jurisdiction.taluka,
            },
            orderBy: {
                createdAt: "desc"
            }
        });

        return c.json(analysis);
    })
    .post("/run", async (c) => {
        const jurisdiction = c.get("jurisdiction");
        const orgId = c.get("orgId");

        try {
            // 1. Run the agent
            const result = await runScanAnalysis(jurisdiction);

            // 2. Count current scans for record keeping
            const scanCount = await prisma.scan.count({
                where: {
                    state: jurisdiction.state === "All" ? undefined : jurisdiction.state,
                    district: jurisdiction.district === "All" ? undefined : jurisdiction.district,
                    taluka: jurisdiction.taluka === "All" ? undefined : jurisdiction.taluka,
                }
            });

            // 3. Save to DB
            const savedAnalysis = await prisma.agentScanAnalysis.create({
                data: {
                    organizationId: orgId,
                    state: jurisdiction.state === "All" ? null : jurisdiction.state,
                    district: jurisdiction.district === "All" ? null : jurisdiction.district,
                    taluka: jurisdiction.taluka === "All" ? null : jurisdiction.taluka,
                    headlines: result.headlines,
                    stats: {
                        diseaseDistribution: result.stats.diseaseDistribution,
                        totalScansAnalyzed: result.stats.totalScansAnalyzed,
                        avgConfidence: result.stats.avgConfidence,
                    },
                    lastScanCount: scanCount,
                    lastProcessedAt: new Date(),
                }
            });

            return c.json({ success: true, analysis: savedAnalysis });
        } catch (error) {
            console.error("Failed to run analysis:", error);
            return c.json({ success: false, error: "Failed to run analysis" }, 500);
        }
    });