import { Scan, Jurisdiction } from "@repo/db";

export interface AnalysisAgentContext {
    jurisdiction: Jurisdiction;
    scans: Partial<Scan>[];
}

export interface AnalysisStats {
    diseaseDistribution: { name: string; count: number }[];
    totalScansAnalyzed: number;
    avgConfidence: number;
}

export interface AnalysisAgentResponse {
    headlines: string[];
    stats: AnalysisStats;
}
