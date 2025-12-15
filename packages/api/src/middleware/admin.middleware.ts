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
  c.set("orgId", session.session.activeOrganizationId)
  console.log("session from the admin middlware", session);
  const member = await prisma.member.findFirst({
    where: {
      userId: session.user.id,
    }
  });
  if (!member || member.role !== "admin") {
    return c.json(
      {
        message: "Unauthorized",
      },
      401,
    );
  }

  await next();
});
