import { Hono } from "hono";
import prisma, { Jurisdiction } from "@repo/db";
import { auth } from "../../auth";

const AdminController = new Hono<{
    Variables: {
        user: typeof auth.$Infer.Session.user;
        session: typeof auth.$Infer.Session.session;
        userId: string;
        orgId: string;
        jurisdiction: Jurisdiction;
    }
}>()
    .get("/hello", (c) => {
        return c.json({ "msg": "Hello from the Admin Route" })
    })


export default AdminController