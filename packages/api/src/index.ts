import { Hono } from "hono";
import { farmerAuth, adminAuth } from "./auth";
import { cors } from "hono/cors";
import { UserSessionMiddleware } from "./middleware/user.middleware";
import WeatherController from "./controllers/user.controllers/weather.controller";
import LocationController from "./controllers/user.controllers/location.controller";
import AiController from "./controllers/user.controllers/agent.controller";
import InvitationController from "./controllers/user.controllers/invitation.controller";
import { AdminSessionMiddleware } from "./middleware/admin.middleware";
import MapController from "./controllers/admin.controller/map.controller";
import { ScanAnalyasisController } from "./controllers/admin.controller/scan.analyasis.controller";
import { OrganizationController } from "./controllers/admin.controller/organization.controller";
import NotificationController from "./controllers/user.controllers/notification.controller";
import AdminNotificationController from "./controllers/admin.controller/notification.controller";
import SettingsController from "./controllers/user.controllers/settings.controller";
import ScanController from "./controllers/user.controllers/scan.controller";

console.log(
  "FRONTEND_URL_FARMER_APP index.ts",
  process.env.FRONTEND_URL_FARMER_APP,
);
console.log(process.env.FRONTEND_URL_ADMIN_APP);

const app = new Hono()
  .use(
    "/*",
    cors({
      origin: [
        ...(process.env.FRONTEND_URL_FARMER_APP
          ? [process.env.FRONTEND_URL_FARMER_APP]
          : []),
        ...(process.env.FRONTEND_URL_ADMIN_APP
          ? [process.env.FRONTEND_URL_ADMIN_APP]
          : []),
      ].filter(Boolean),
      // filter removes any undefined url in the arrays

      credentials: true, // cookies
      allowMethods: ["GET", "POST", "OPTIONS", "PATCH", "DELETE"],
      // allowHeaders: ['Content-Type', 'Authorization', 'Cookie'],
      // exposeHeaders: ['Set-Cookie']
    }),
  )
  .on(["POST", "GET"], "/api/auth/*", (c) => {
    const origin = c.req.header("Origin");
    const adminUrl = process.env.FRONTEND_URL_ADMIN_APP;

    // If request comes from Admin app, use adminAuth
    if (adminUrl && origin === adminUrl) {
      return adminAuth.handler(c.req.raw);
    }

    // Default to farmerAuth handler
    return farmerAuth.handler(c.req.raw);
  })


  .use("/api/locations/*", UserSessionMiddleware)
  .use("/api/weather/*", UserSessionMiddleware)
  .use("/api/ai/*", UserSessionMiddleware)
  .use("/api/settings/*", UserSessionMiddleware)
  .use("/api/scans/*", UserSessionMiddleware)
  .use("/api/notifications/*", UserSessionMiddleware)
  .use("/api/user/*", UserSessionMiddleware)
  .use("/api/admin/*", AdminSessionMiddleware)
  .use("/api/admin/*", AdminSessionMiddleware)
  .route("/api/weather", WeatherController)
  .route("/api/locations", LocationController)
  .route("/api/ai", AiController)
  .route("/api/invitation", InvitationController)
  .route("/api/notifications", NotificationController)
  .route("/api/settings", SettingsController)
  .route("/api/scans", ScanController)
  .route("/api/admin/map", MapController)
  .route("/api/admin/analysis", ScanAnalyasisController)
  .route("/api/admin/organization", OrganizationController)
  .route("/api/admin/notifications", AdminNotificationController)

export type AppType = typeof app;

export { app };
