import { app } from "@repo/api";
import { handle } from "hono/vercel";

export const config = {
    runtime: 'nodejs'
};

const port = process.env.BACKEND_PORT || 4000;

// For Vercel Serverless
export const GET = handle(app);
export const POST = handle(app);
export const PUT = handle(app);
export const DELETE = handle(app);
export const PATCH = handle(app);
export const OPTIONS = handle(app);

// For Bun Runtime (fallback if run locally)
export default {
    port,
    fetch: app.fetch,
};
