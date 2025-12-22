import prisma, { Jurisdiction } from "@repo/db";
import { AnalysisAgentContext } from "./types";

export const ScanAnalyasisContext = async (jurisdiction: Jurisdiction): Promise<AnalysisAgentContext> => {
    const where: any = {};

    if (jurisdiction.state !== "All") {
        where.state = jurisdiction.state;
    }
    if (jurisdiction.district !== "All") {
        where.district = jurisdiction.district;
    }
    if (jurisdiction.taluka !== "All") {
        where.taluka = jurisdiction.taluka;
    }
    if (jurisdiction.village !== "All") {
        where.village = jurisdiction.village;
    }

    const scans = await prisma.scan.findMany({
        where,
        select: {
            id: true,
            createdAt: true,
            crop: true,
            visualIssue: true,
            diagnosis: true,
            visualSeverity: true,
            confidence: true,
            village: true,
            taluka: true,
            district: true,
        },
        orderBy: {
            createdAt: "desc",
        },
        take: 100, // Limit to 100 recent scans for context
    });

    return {
        jurisdiction,
        scans,
    };
};
