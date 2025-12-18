import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";

interface ImageAnalysisResponse {
  isValid: boolean;
  rejectionReason: string;
  metadata: {
    crop: string;
    visualIssue: string;
    description: string;
    confidence: number;
  };
  generatedFilename: string;
}

// 5. Parse Response
interface GatekeeperAgentResponse {
  isValidCrop: boolean;
  confidence: number;
  cropDetected: string;
  visualIssue: string;
  filenameSlug: string;
  description: string;
  rejectionReason: string;
}

// Initialize Gemini Client
console.log("Api Key is", process.env.GOOGLE_GENERATIVE_AI_API_KEY);
const genAI = new GoogleGenerativeAI(
  process.env.GOOGLE_GENERATIVE_AI_API_KEY || "",
);

export const analyzeCropImage = async (imageBase64: string) => {
  try {
    // 1. Parse the Base64 input strictly
    // Handles data:image/jpeg;base64,..... format
    const matches = imageBase64.match(/^data:(.+);base64,(.+)$/);
    const mimeType = matches?.[1] ?? "image/jpeg";
    const data = matches?.[2] ?? imageBase64;

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash-lite",
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: {
          type: SchemaType.OBJECT,
          properties: {
            // --- Validation Logic ---
            isValidCrop: {
              type: SchemaType.BOOLEAN,
              description:
                "True ONLY if the image contains a plant, crop, fruit, or vegetable. False for selfies, documents, or non-agri objects.",
            },
            confidence: {
              type: SchemaType.NUMBER,
              description: "Confidence score between 0.0 and 1.0",
            },
            rejectionReason: {
              type: SchemaType.STRING,
              description:
                "If invalid, explain why (e.g., 'Blurred', 'Not a plant'). If valid, return 'None'.",
            },

            // --- Metadata / Labeling Logic ---
            cropDetected: {
              type: SchemaType.STRING,
              description:
                "The specific crop name (e.g., 'Sugarcane', 'Tomato'). Use 'Unknown' if unclear.",
            },
            visualIssue: {
              type: SchemaType.STRING,
              description:
                "Short visual observation (e.g., 'Yellowing leaves', 'Rust spots', 'Healthy'). NOT a medical diagnosis.",
            },

            // Note: We ask for a SLUG, not a full filename.
            filenameSlug: {
              type: SchemaType.STRING,
              description:
                "A short, snake_case descriptor of the content. Example: 'sugarcane_rust' or 'tomato_early_blight'. DO NOT include numbers or IDs.",
            },
            description: {
              type: SchemaType.STRING,
              description:
                "A professional 1-sentence summary of the visual data for the Admin Dashboard.",
            },
          },
          required: [
            "isValidCrop",
            "confidence",
            "cropDetected",
            "visualIssue",
            "filenameSlug",
            "description",
          ],
        },
      },
    });

    // 3. The System Prompt
    const prompt = `
      You are the 'Visual Gatekeeper' for Cropia.
      
      Your Goal:
      1. VALIDATE: Strictly filter out non-agricultural images.
      2. LABEL: Extract structured metadata for valid images.
      
      Instructions for 'filenameSlug':
      - Return ONLY the semantic description in snake_case.
      - GOOD: 'sugarcane_leaf_spot'
      - BAD: 'sugarcane_leaf_spot_01', 'img_234', 'scan_v1'
      
      Instructions for 'description':
      - Write for an Admin Dashboard. Be concise and factual.
      - Example: "Sugarcane leaf displaying orange lesions consistent with rust."
    `;

    // 4. Generate Content
    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: data,
          mimeType: mimeType,
        },
      },
    ]);
    console.log("result from gatekeeper.agent", result.response.text());

    const responseText = result.response.text();
    const analysis: GatekeeperAgentResponse = JSON.parse(responseText);
    console.log("analysis from gatekeeper.agent", analysis);

    // 6. Post-Processing: Generate Unique Filename
    // We do this in code to ensure it is mathematically unique and conflict-free.
    let finalFilename = "";

    if (analysis.isValidCrop && analysis.filenameSlug) {
      // Logic: {slug}_{timestamp_base36}
      // Example: sugarcane_rust_lz4f8q9
      const uniqueSuffix = Date.now().toString(36);
      finalFilename = `${analysis.filenameSlug}_${uniqueSuffix}`;
    }

    // 7. Return Structured Data
    return {
      isValid: analysis.isValidCrop,
      rejectionReason:
        analysis.rejectionReason === "None" ? null : analysis.rejectionReason,
      metadata: {
        crop: analysis.cropDetected,
        visualIssue: analysis.visualIssue,
        description: analysis.description,
        confidence: analysis.confidence,
      },
      // This is what you pass to Cloudinary
      generatedFilename: finalFilename,
    } as ImageAnalysisResponse;
  } catch (error) {
    console.error("Gatekeeper Error:", error);
    // Fail safe: If AI crashes, we don't want to crash the app, but we must reject the image.
    return {
      isValid: false,
      rejectionReason: "AI Service Unavailable",
      metadata: null,
      generatedFilename: null,
    };
  }
};
