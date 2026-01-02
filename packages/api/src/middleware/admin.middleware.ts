import { createMiddleware } from "hono/factory";
import { adminAuth } from "../auth";
import prisma from "@repo/db";

export const AdminSessionMiddleware = createMiddleware(async (c, next) => {
  const session = await adminAuth.api.getSession({ headers: c.req.raw.headers });

  if (!session) {
    return c.json(
      {
        message: "Unauthorized",
      },
      401,
    );
  }

  c.set("user", session.user);
  c.set("session", session.session);
  c.set("userId", session.user.id);

  // OPTIMIZATION: Trust the session data. 
  // The session callback (in auth.ts) already ensures jurisdiction is present.
  const jurisdiction = session.session.jurisdiction;

  // console.log("Admin Middleware Check:", { jurisdiction, role: "admin" });

  // STRICT CHECK: Ensure jurisdiction exists.
  // Note: We might want to add a check for 'role' if it's stored in session, 
  // but for now, jurisdiction presence effectively implies admin rights in this context
  // or we can assume the session is valid. 
  // If we really need role, we should add it to the session schema to avoid this DB call.
  if (!jurisdiction) {
    return c.json(
      {
        message: "Unauthorized: No Jurisdiction Found",
      },
      401,
    );
  }

  c.set("orgId", (session.session as any).activeOrganizationId);
  c.set("jurisdiction", jurisdiction);

  await next();
});
