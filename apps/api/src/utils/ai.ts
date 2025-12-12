import { streamText } from "ai";
import { google } from "@ai-sdk/google";

const { textStream } = streamText({
  model: google("gemini-2.5-flash"),
  prompt: "Tell me something about Ancient India",
});

export async function processStream(textStream: any) {
  for await (const textPart of textStream) {
    // console.clear();
    console.log(textPart);
  }
