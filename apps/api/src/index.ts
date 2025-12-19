import { app } from "@repo/api";

const port = process.env.BACKEND_PORT || 4000;

console.log(`Starting server on port ${port}`);

export default {
    port,
    fetch: app.fetch,
};
