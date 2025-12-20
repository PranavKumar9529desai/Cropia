import { google } from "@ai-sdk/google";
import { generateObject } from "ai";
import { z } from "zod";

// --- SCHEMA DEFINITIONS ---

const AnalysisSchema = z.object({
  isValidCrop: z.boolean().describe("True ONLY if the image contains a plant, crop, fruit, or vegetable. False for selfies, documents, or non-agri objects."),
  confidence: z.number().describe("Confidence score between 0.0 and 1.0"),
  rejectionReason: z.string().describe("If invalid, explain why (e.g., 'Blurred', 'Not a plant'). If valid, return 'None'."),
  cropDetected: z.string().describe("The specific crop name (e.g., 'Sugarcane', 'Tomato'). Use 'Unknown' if unclear."),
  visualIssue: z.string().describe("Short visual observation of the physical state (e.g., 'Yellowing leaves', 'Rust spots', 'No issues')."),
  diagnosis: z.string().describe("The scientific or common name of the detected disease/pest. Use 'Healthy' if no issue is found."),
  visualSeverity: z.enum(["healthy", "warning", "critical"]).describe("Classify based on urgency: 'healthy' (no issues), 'warning' (minor spots, early stress), 'critical' (severe disease, pest outbreak, widespread damage)."),
  filenameSlug: z.string().describe("A short, snake_case descriptor of the content. Example: 'sugarcane_rust' or 'tomato_early_blight'. DO NOT include numbers or IDs."),
  description: z.string().describe("A professional 1-sentence summary of the visual data for the Admin Dashboard."),
});

type AnalysisResult = z.infer<typeof AnalysisSchema>;

export interface ImageAnalysisResponse {
  isValid: boolean;
  rejectionReason: string | null;
  metadata: {
    crop: string;
    visualIssue: string;
    diagnosis: string;
    visualSeverity: "healthy" | "warning" | "critical";
    description: string;
    confidence: number;
  } | null;
  generatedFilename: string | null;
}

export const analyzeCropImage = async (imageBase64: string): Promise<ImageAnalysisResponse> => {
  try {
    // 1. Parse the Base64 input
    const matches = imageBase64.match(/^data:(.+);base64,(.+)$/);
    const mimeType = matches?.[1] ?? "image/jpeg";
    const base64Data = matches?.[2] ?? imageBase64;

    console.log("[Gatekeeper V2] Analyzing image...");
    const { object } = await generateObject({
      model: google("gemini-2.0-flash-exp"),
      schema: AnalysisSchema,
      messages: [
        {
          role: "user" as const,
          content: [
            {
              type: "text" as const,
              text: `You are the 'Visual Gatekeeper' for Cropia, a professional agricultural AI.
              
              CRITICAL: You MUST return a complete object with ALL fields defined in the schema.
              
              Your Goal:
              1. VALIDATE: Strictly filter out non-agricultural images. Selfies, documents, or house interiors are INVALID.
              2. LABEL: Extract structured metadata for valid images.
              
              Field Instructions:
              - 'isValidCrop': true ONLY for plants/crops.
              - 'diagnosis': Be specific about the disease or pest. If it's a nutrient deficiency, name it. If healthy, return 'Healthy'.
              - 'visualSeverity': 
                - 'healthy': No visible issues.
                - 'warning': Early signs of stress, minor spots, or small pest count.
                - 'critical': Widespread damage, severe disease, or major pest outbreak.
              - 'filenameSlug': semantic_snake_case (e.g., 'tomato_late_blight'). No IDs.
              - 'description': One professional sentence for an expert dashboard.`,
            },
            {
              type: "image" as const,
              image: base64Data,
            },
          ],
        },
      ],
    });

    console.log("[Gatekeeper V2] Structured Analysis:", JSON.stringify(object, null, 2));

    // 3. Post-Processing: Generate Unique Filename
    let finalFilename: string | null = null;
    if (object.isValidCrop && object.filenameSlug) {
      const uniqueSuffix = Date.now().toString(36);
      finalFilename = `${object.filenameSlug}_${uniqueSuffix}`;
    }

    // 4. Return Structured Data
    return {
      isValid: object.isValidCrop,
      rejectionReason: object.rejectionReason === "None" ? null : object.rejectionReason,
      metadata: object.isValidCrop ? {
        crop: object.cropDetected,
        visualIssue: object.visualIssue,
        diagnosis: object.diagnosis,
        visualSeverity: object.visualSeverity,
        description: object.description,
        confidence: object.confidence,
      } : null,
      generatedFilename: finalFilename,
    };
  } catch (error) {
    console.error("[Gatekeeper V2] Error:", error);
    return {
      isValid: false,
      rejectionReason: "AI Service Unavailable",
      metadata: null,
      generatedFilename: null,
    };
  }
};
