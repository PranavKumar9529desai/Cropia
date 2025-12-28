import prisma, { Jurisdiction } from "@repo/db";
import { AnalysisAgentContext } from "./types";

export const ScanAnalyasisContext = async (
  jurisdiction: Jurisdiction,
): Promise<AnalysisAgentContext> => {
  let where: any = {};

  if (jurisdiction.state !== "All") {
    where.state = { contains: jurisdiction.state, mode: "insensitive" };
  }
  if (jurisdiction.district !== "All") {
    where.district = { contains: jurisdiction.district, mode: "insensitive" };
  }
  if (jurisdiction.taluka !== "All") {
    where.taluka = { contains: jurisdiction.taluka, mode: "insensitive" };
  }
  if (jurisdiction.village !== "All") {
    where.village = { contains: jurisdiction.village, mode: "insensitive" };
  }

  console.log("Searching scans with where:", JSON.stringify(where, null, 2));

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
      state: true,
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 100, // Limit to 100 recent scans for context
  });

  console.log(`Found ${scans.length} scans for the jurisdiction.`);
  if (scans.length > 0) {
    console.log("Sample scan jurisdiction:", {
      state: scans[0].state,
      district: scans[0].district,
      taluka: scans[0].taluka,
    });
  }

  return {
    jurisdiction,
    scans,
  };
};
