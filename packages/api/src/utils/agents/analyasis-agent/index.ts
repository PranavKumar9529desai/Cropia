import { google } from "@ai-sdk/google";
import { generateObject } from "ai";
import { z } from "zod";
import { Jurisdiction } from "@repo/db";
import { ScanAnalyasisContext } from "./context";
import { generateAnalysisPrompt } from "./prompt";
import { AnalysisAgentResponse } from "./types";

const AnalysisResponseSchema = z.object({
    headlines: z.array(z.string()).describe("3-5 punchy, informative headlines about the crop health trends in the region."),
    stats: z.object({
        diseaseDistribution: z.array(z.object({
            name: z.string().describe("Name of the disease or issue (e.g., 'Sugarcane Rust', 'Healthy')"),
            count: z.number().describe("Number of scans where this was found")
        })).describe("List of diseases or issues found and their counts."),
        totalScansAnalyzed: z.number().describe("Total number of scans processed in this analysis."),
        avgConfidence: z.number().describe("Average confidence score of the AI diagnoses."),
    }),
});

export const runScanAnalysis = async (jurisdiction: Jurisdiction): Promise<AnalysisAgentResponse> => {
    try {
        console.log(`[Analysis Agent] Gathering context for: ${JSON.stringify(jurisdiction)}`);
        const context = await ScanAnalyasisContext(jurisdiction);

        if (context.scans.length === 0) {
            console.log(`[Analysis Agent] No scans found for this jurisdiction. Returning default response.`);
            return {
                headlines: [
                    "No crop scan data available for this region yet.",
                    "Encourage farmers to upload photos for health monitoring.",
                    "Stay tuned for AI-powered regional insights."
                ],
                stats: {
                    diseaseDistribution: [],
                    totalScansAnalyzed: 0,
                    avgConfidence: 0,
                },
            };
        }

        console.log(`[Analysis Agent] Found ${context.scans.length} scans. Generating prompt...`);
        const prompt = generateAnalysisPrompt(context);

        console.log(`[Analysis Agent] Calling Gemini...`);
        const { object } = await generateObject({
            model: google("gemini-2.5-flash-lite"),
            schema: AnalysisResponseSchema,
            prompt: prompt,
        });

        console.log(`[Analysis Agent] Analysis complete.`);
        return object as AnalysisAgentResponse;
    } catch (error) {
        console.error("[Analysis Agent] Error during analysis:", error);
        throw error;
    }
};
