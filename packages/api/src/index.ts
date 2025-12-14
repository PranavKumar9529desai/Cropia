import { Hono } from "hono";
import { auth } from "./auth";
import { cors } from "hono/cors";
import { sessionMiddleware } from "./middleware/middleware";
import WeatherController from "./controllers/weather.controller";
import LocationController from "./controllers/location.controller";
import AiController from "./controllers/agent.controller";
import InvitationController from "./controllers/invitation.controller";

console.log(process.env.FRONTEND_URL_FARMER_APP)
const app = new Hono()
  .use(
    "/*",
    cors({
      origin: [
        ...(process.env.FRONTEND_URL_FARMER_APP ? [process.env.FRONTEND_URL_FARMER_APP] : []),
        ...(process.env.FRONTEND_URL_ADMIN_APP ? [process.env.FRONTEND_URL_ADMIN_APP] : []),
        ...(process.env.NODE_ENV !== 'production' ? ["http://localhost:5000", "http://localhost:5001", "http://65.2.9.16:4000"] : [])
      ].filter(Boolean),
      // filter removes any undefined url in the arrays

      credentials: true, // cookies
      allowMethods: ["GET", "POST", "OPTIONS", "PATCH", "DELETE"],
      // allowHeaders: ['Content-Type', 'Authorization', 'Cookie'],
      // exposeHeaders: ['Set-Cookie']
    }),
  )
  .on(["POST", "GET"], "/api/auth/*", (c) => {
    return auth.handler(c.req.raw);
  })

  .use("/api/locations/*", sessionMiddleware)
  .use("/api/weather/*", sessionMiddleware)
  .use("/api/ai/*", sessionMiddleware)
  .route("/api/weather", WeatherController)
  .route("/api/locations", LocationController)
  .route("/api/ai", AiController)
  .route("/api/invitation", InvitationController);

export type AppType = typeof app;

export default {
  port: process.env.BACKEND_PORT,
  fetch: app.fetch,
};
