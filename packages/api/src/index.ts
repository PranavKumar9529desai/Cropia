import { Hono } from "hono";
import { auth } from "./auth";
import { cors } from "hono/cors";
import { UserSessionMiddleware } from "./middleware/user.middleware";
import WeatherController from "./controllers/weather.controller";
import LocationController from "./controllers/location.controller";
import AiController from "./controllers/agent.controller";
import InvitationController from "./controllers/invitation.controller";
import { AdminSessionMiddleware } from "./middleware/admin.middleware";
import AdminController from "./controllers/admin.controller";

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

  .use("/api/locations/*", UserSessionMiddleware)
  .use("/api/weather/*", UserSessionMiddleware)
  .use("/api/ai/*", UserSessionMiddleware)
  .use("/api/admin/*", AdminSessionMiddleware)
  .route("/api/weather", WeatherController)
  .route("/api/locations", LocationController)
  .route("/api/ai", AiController)
  .route("/api/invitation", InvitationController)
  .route("/api/admin", AdminController)

export type AppType = typeof app;

export default {
  port: process.env.BACKEND_PORT,
  fetch: app.fetch,
};
