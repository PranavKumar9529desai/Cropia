import { prisma } from "@repo/db";
import type { auth } from "../../auth";
import { Hono } from "hono";
import { streamText, convertToModelMessages } from "ai";
import { google } from "@ai-sdk/google";
import { analyzeCropImage } from "../../utils/agents/gatekeeper.agent";
import { uploadImage } from "../../utils/upload-image";
import { getCropContext } from "../../utils/agents/assistant-agent/context";
import { generateFarmerPrompt } from "../../utils/agents/assistant-agent/prompt";
import { FarmerContext } from "../../utils/agents/assistant-agent/types";
import { createLocationObject } from "../../utils/scan.helpers";

const AiController = new Hono<{
  Variables: {
    user: typeof auth.$Infer.Session.user | null;
    session: typeof auth.$Infer.Session.session | null;
    userId: string;
  };
}>()
  .post("analyze-crop", async (c) => {
    console.log("Agent Controller is called");
    const { imageBase64 } = await c.req.json();

    // 1. Ask Gemini: Is this a valid crop?
    const result = await analyzeCropImage(imageBase64);

    // 2. SERVER-SIDE LOGIC (The benefit of using Hono)
    if (result.isValid && result.metadata && result.generatedFilename) {
      console.log("Valid crop found, saving to DB...");

      try {
        // 2. Get User Location
        const userLocation = await prisma.location.findUnique({
          where: { userId: c.var.userId },
        });

        // We use the generated filename and description from the AI
        const ImageMetaData = {
          description: result.metadata.description,
          crop: result.metadata.crop,
          diagnosis: result.metadata.visualIssue,
          district: userLocation?.district as string,
          userId: c.get("userId"),
        };

        const uploadResult = await uploadImage(
          imageBase64,
          result.generatedFilename,
          ImageMetaData,
        );

        // 3. Create Scan Record
        await prisma.scan.create({
          data: {
            imageUrl: uploadResult.secure_url,
            publicId: uploadResult.public_id,
            crop: result.metadata.crop,

            visualIssue: result.metadata.visualIssue,
            diagnosis: result.metadata.diagnosis,
            visualSeverity: result.metadata.visualSeverity,
            confidence: result.metadata.confidence,

            // Location Snapshot
            state: userLocation?.state,
            district: userLocation?.district,
            city: userLocation?.city,
            taluka: userLocation?.taluka,
            village: userLocation?.village,
            pincode: userLocation?.pincode,
            latitude: userLocation?.latitude,
            longitude: userLocation?.longitude,
            ...((userLocation?.latitude && userLocation?.longitude)
              ? createLocationObject(userLocation.latitude, userLocation.longitude)
              : {}),

            userId: c.var.userId,
            // organizationId: c.var.session?.activeOrganizationId
          },
        });
        console.log("Scan saved successfully");
      } catch (error) {
        console.error("Error saving scan:", error);
      }
    }

    // 3. Return JSON to frontend
    return c.json(result);
  })
  .post("/chat", async (c) => {
    const userId = c.get("userId");
    const { messages } = await c.req.json();

    // we don't need run this each chat
    // somehow we need to cache it.
    const chatContext = await getCropContext(userId);

    if (!chatContext.data) {
      // Return a 400/404 so the client knows not to retry infinitely
      return c.json({ error: "User Context Not Found" }, 404);
    }

    const systemPrompt = generateFarmerPrompt(
      chatContext.data as unknown as FarmerContext,
    );

    // AI SDK v5: streamText returns the result object immediately`
    const result = await streamText({
      // maxium rate limit model
      model: google("gemini-2.5-flash-lite"),
      system: systemPrompt,
      messages: convertToModelMessages(messages), // Convert UI messages to Core messages
    });

    // This method now exists and handles the headers + data stream format
    return result.toUIMessageStreamResponse();
  });

export default AiController;
