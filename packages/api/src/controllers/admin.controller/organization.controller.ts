import { Hono } from "hono";
import prisma, { Jurisdiction } from "@repo/db";
import { adminAuth } from "../../auth";
import { getJurisdictionFilter, getJurisdictionDetails } from "../../utils/jurisdiction";
import { subDays, startOfDay, format, addDays } from "date-fns";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import { nanoid } from "nanoid";
import OrganizationInviteController from "./organization.invite.controller";

export const OrganizationController = new Hono<{
    Variables: {
        user: typeof adminAuth.$Infer.Session.user;
        session: typeof adminAuth.$Infer.Session.session;
        userId: string;
        orgId: string;
        jurisdiction: Jurisdiction;
    };
}>()
    .route("/invite", OrganizationInviteController)
    .get("/dashboard", async (c) => {
        const orgId = c.get("orgId");
        const jurisdiction = c.get("jurisdiction");
        const range = c.req.query("range") || "30d";

        let startDate: Date | undefined;
        let days = 30;

        if (range === "7d") { startDate = subDays(new Date(), 7); days = 7; }
        else if (range === "30d") { startDate = subDays(new Date(), 30); days = 30; }
        else if (range === "90d") { startDate = subDays(new Date(), 90); days = 90; }

        const filter = getJurisdictionFilter(jurisdiction);
        const dateFilter = startDate ? { createdAt: { gte: startDate } } : {};

        // 1. Fetch Organization Basic Info
        const organization = await prisma.organization.findUnique({
            where: { id: orgId },
            select: {
                id: true,
                name: true,
                logo: true,
                metadata: true,
            },
        });

        if (!organization) {
            return c.json({ error: "Organization not found" }, 404);
        }

        // 2. Pulse Statistics & Scans
        const [totalMembers, scans, latestAnalyses] = await Promise.all([
            prisma.member.count({ where: { organizationId: orgId } }),
            prisma.scan.findMany({
                where: {
                    ...filter,
                    ...dateFilter,
                },
                select: {
                    id: true,
                    confidence: true,
                    village: true,
                    createdAt: true,
                    district: true,
                    taluka: true,
                    visualIssue: true,
                    visualSeverity: true,
                },
            }),
            prisma.agentScanAnalysis.findMany({
                where: {
                    organizationId: orgId,
                    state: jurisdiction.state === "All" ? null : jurisdiction.state,
                    district: jurisdiction.district === "All" ? null : jurisdiction.district,
                    taluka: jurisdiction.taluka === "All" ? null : jurisdiction.taluka,
                },
                orderBy: { createdAt: "desc" },
                take: 3,
            }),
        ]);

        const totalScans = scans.length;
        const avgConfidence = totalScans > 0
            ? (scans.reduce((acc, s) => acc + (s.confidence || 0), 0) / totalScans) * 100
            : 0;

        const uniqueVillages = new Set(scans.map(s => s.village).filter(Boolean)).size;

        // 3. Scan Trends
        const lastNDays = Array.from({ length: days }).map((_, i) => {
            const date = subDays(new Date(), i);
            return format(date, "MMM dd");
        }).reverse();

        const trendsMap: Record<string, number> = {};
        lastNDays.forEach(day => trendsMap[day] = 0);

        const rangeLimit = startDate ? startOfDay(startDate) : subDays(startOfDay(new Date()), 365);
        scans.forEach(scan => {
            if (scan.createdAt >= rangeLimit) {
                const day = format(scan.createdAt, "MMM dd");
                if (trendsMap[day] !== undefined) {
                    trendsMap[day]++;
                }
            }
        });

        const trends = Object.entries(trendsMap).map(([date, scans]) => ({ date, scans }));

        // 4. Regional Impact
        const details = getJurisdictionDetails(jurisdiction);
        let groupLevel: "district" | "taluka" | "village" = "district";

        if (details?.level === "district") groupLevel = "taluka";
        if (details?.level === "taluka") groupLevel = "village";

        const regionalMap: Record<string, number> = {};
        scans.forEach(scan => {
            const key = (scan as any)[groupLevel] || "Unknown";
            regionalMap[key] = (regionalMap[key] || 0) + 1;
        });

        const regions = Object.entries(regionalMap)
            .map(([name, count]) => ({ name, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 10);

        // 5. Health Distribution
        const healthMap: Record<string, number> = { Healthy: 0, Warning: 0, Critical: 0 };
        scans.forEach(scan => {
            const severity = scan.visualSeverity?.toLowerCase() || "healthy";
            if (severity === "critical") healthMap.Critical++;
            else if (severity === "warning") healthMap.Warning++;
            else healthMap.Healthy++;
        });

        const totalForHealth = totalScans || 1;
        const health = [
            { name: "Healthy", value: Math.round((healthMap.Healthy / totalForHealth) * 100) },
            { name: "Warning", value: Math.round((healthMap.Warning / totalForHealth) * 100) },
            { name: "Critical", value: Math.round((healthMap.Critical / totalForHealth) * 100) },
        ];

        return c.json({
            info: organization,
            stats: {
                totalMembers,
                totalScans,
                avgConfidence: avgConfidence.toFixed(1),
                uniqueVillages,
            },
            charts: {
                trends,
                regions,
                health,
            },
            latestAnalyses,
            range,
        });
    })
    .get("/members", async (c) => {
        const orgId = c.get("orgId");
        // Use Better Auth API to list members
        // Passing headers is required for server-side API calls to resolve session
        const result = await (adminAuth.api as any).listMembers({
            query: {
                organizationId: orgId
            },
            headers: c.req.raw.headers
        });

        // Better Auth returns an object, we need the members array
        return c.json(result?.members || []);
    })
    .get("/members/:memberId", async (c) => {
        const orgId = c.get("orgId");
        const memberId = c.req.param("memberId");

        const member = await prisma.member.findFirst({
            where: { id: memberId, organizationId: orgId },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        image: true,
                    },
                },
            },
        });

        if (!member) return c.json({ error: "Member not found" }, 404);

        return c.json(member);
    })
    .delete("/members/:memberId", async (c) => {
        const orgId = c.get("orgId");
        const memberId = c.req.param("memberId");

        try {
            await (adminAuth.api as any).removeMember({
                body: {
                    memberId: memberId,
                    organizationId: orgId
                },
                headers: c.req.raw.headers
            });
            return c.json({ success: true });
        } catch (error: any) {
            return c.json({ error: error.message || "Failed to remove member" }, 400);
        }
    });
