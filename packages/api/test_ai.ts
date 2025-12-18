import { streamText } from "ai";
import { google } from "@ai-sdk/google";

async function test() {
  console.log("Testing streamText...");
  try {
    const result = streamText({
      model: google("models/gemini-1.5-flash"),
      messages: [{ role: "user", content: "Hello" }],
    });
    console.log("Result keys:", Object.keys(result));
    // @ts-ignore
    console.log(
      "Has toDataStreamResponse:",
      typeof result.toDataStreamResponse,
    );
    console.log(
      "Has toTextStreamResponse:",
      typeof result.toTextStreamResponse,
    );
    // @ts-ignore
    console.log(
      "Has toUIMessageStreamResponse:",
      typeof result.toUIMessageStreamResponse,
    );

    const pkg = await import("ai/package.json");
    console.log("AI Package Version:", pkg.version);
  } catch (e) {
    console.error("Error:", e);
  }
}

test();
