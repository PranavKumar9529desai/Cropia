import { createMiddleware } from "hono/factory";
import { farmerAuth } from "../auth";

export const UserSessionMiddleware = createMiddleware(async (c, next) => {
  const session = await farmerAuth.api.getSession({
    headers: c.req.raw.headers,
  });

  if (!session) {
    return c.json(
      {
        message: "Unauthorized",
      },
      401,
    );
  }
  console.log(session);
  console.log(session.user);
  c.set("user", session.user);
  c.set("session", session.session);
  c.set("userId", session.user.id);

  await next();
});
