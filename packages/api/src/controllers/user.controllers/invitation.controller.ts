import { Hono } from "hono";
import prisma from "@repo/db";

const app = new Hono();
// public Controller
// so no Variables passed through the controller
app.get("/:id", async (c) => {
  const id = c.req.param("id");

  const invitation = await prisma.invitation.findUnique({
    where: { id },
    include: {
      organization: true,
    },
  });

  if (!invitation) {
    return c.json({ error: "Invitation not found" }, 404);
  }

  if (invitation.expiresAt < new Date()) {
    return c.json({ error: "Invitation expired" }, 400);
  }

  if (invitation.status !== "pending") {
    return c.json({ error: "Invitation already accepted or canceled" }, 400);
  }

  return c.json({
    email: invitation.email,
    organizationName: invitation.organization.name,
    inviterId: invitation.inviterId,
  });
});

export default app;
