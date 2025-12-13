import { createMiddleware } from "hono/factory";
import { auth } from "../auth";

export const sessionMiddleware = createMiddleware(async (c, next) => {
  const session = await auth.api.getSession({ headers: c.req.raw.headers });
  console.log("session is this", session);

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

  await next();
});
