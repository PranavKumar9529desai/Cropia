import { createMiddleware } from "hono/factory";
import { auth } from "../auth";
import prisma from "@repo/db";

export const AdminSessionMiddleware = createMiddleware(async (c, next) => {
  const session = await auth.api.getSession({ headers: c.req.raw.headers });

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
  console.log("Admin Middleware is called", session)
  const member = await prisma.member.findFirst({
    where: {
      userId: session.user.id,
    }
  });
  console.log("Member is", member)
  if (!member || member.role !== "admin" || !member.jurisdiction) {
    return c.json(
      {
        message: "Unauthorized",
      },
      401,
    );
  }
  const jurisdiction = member.jurisdiction
  c.set("orgId", session.session.activeOrganizationId)
  c.set("jurisdiction", jurisdiction)

  await next();
});
