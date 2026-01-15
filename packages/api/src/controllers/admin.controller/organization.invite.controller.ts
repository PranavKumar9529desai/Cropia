import { Hono } from "hono";
import prisma, { Jurisdiction } from "@repo/db";
import { adminAuth } from "../../auth";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import { fetchLocationByPincode } from "../../utils/location-helpers-2";
import {
  fetchStates,
  fetchDistricts,
  fetchTalukas,
  fetchVillages,
} from "../../utils/location-helpers";

export const OrganizationInviteController = new Hono<{
  Variables: {
    user: typeof adminAuth.$Infer.Session.user;
    session: typeof adminAuth.$Infer.Session.session;
    userId: string;
    orgId: string;
    jurisdiction: Jurisdiction;
  };
}>()
  // --- INVITATION ENDPOINTS ---

  .get("/", async (c) => {
    const orgId = c.get("orgId");
    try {
      const invitations = await prisma.invitation.findMany({
        where: {
          organizationId: orgId,
          status: "pending",
        },
        orderBy: {
          createdAt: "desc",
        },
      });
      return c.json(invitations);
    } catch (error) {
      console.error("List Invitations Error:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to list invitations";
      return c.json({ error: errorMessage }, 400);
    }
  })

  .post(
    "/",
    zValidator(
      "json",
      z.object({
        email: z.string().email(),
        role: z.enum(["owner", "admin", "viewer"]),
        jurisdiction: z.object({
          state: z.string(),
          district: z.string(),
          taluka: z.string(),
          village: z.string(),
        }),
      }),
    ),
    async (c) => {
      const orgId = c.get("orgId");
      const { email, role, jurisdiction } = c.req.valid("json");

      try {
        const invitation = await (
          adminAuth.api as unknown as {
            createInvitation: (p: {
              body: any;
              headers: Headers;
            }) => Promise<any>;
          }
        ).createInvitation({
          body: {
            email,
            role: role as "owner" | "admin" | "viewer",
            organizationId: orgId,
            jurisdiction: jurisdiction,
          },
          headers: c.req.raw.headers,
        });

        return c.json(invitation);
      } catch (error: any) {
        console.error("Invite Error:", error);
        return c.json(
          { error: error.message || "Failed to create invitation" },
          400,
        );
      }
    },
  )

  .delete("/:invitationId", async (c) => {
    const orgId = c.get("orgId");
    const invitationId = c.req.param("invitationId");

    try {
      await (
        adminAuth.api as unknown as {
          cancelInvitation: (p: {
            body: { invitationId: string; organizationId: string };
            headers: Headers;
          }) => Promise<any>;
        }
      ).cancelInvitation({
        body: {
          invitationId,
          organizationId: orgId,
        },
        headers: c.req.raw.headers,
      });
      return c.json({ success: true });
    } catch (error) {
      console.error("Cancel Invitation Error:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to cancel invitation";
      return c.json({ error: errorMessage }, 400);
    }
  })

  // --- LOCATION PROXY ENDPOINTS ---

  .get("/pincode/:pincode", async (c) => {
    try {
      const pincode = c.req.param("pincode");
      if (!pincode || pincode.length < 6) {
        return c.json({ success: false, error: "Invalid pincode" }, 400);
      }

      const locationData = await fetchLocationByPincode(pincode);

      if (!locationData) {
        return c.json(
          {
            success: false,
            error: "Location details not found for this pincode",
          },
          404,
        );
      }

      return c.json({ success: true, data: locationData });
    } catch (error) {
      console.error("Error fetching location by pincode:", error);
      return c.json(
        { success: false, error: "Failed to fetch location data" },
        500,
      );
    }
  })

  .get("/states", async (c) => {
    try {
      const states = await fetchStates();
      return c.json({ success: true, data: { states } });
    } catch (error) {
      console.error("Error fetching states:", error);
      return c.json({ success: false, error: "Failed to fetch states" }, 500);
    }
  })

  .get("/districts/:state_name", async (c) => {
    try {
      const state_name = c.req.param("state_name");
      const districts = await fetchDistricts(state_name);
      return c.json({ success: true, data: { districts } });
    } catch (error) {
      console.error("Error fetching districts:", error);
      return c.json(
        { success: false, error: "Failed to fetch districts" },
        500,
      );
    }
  })

  .get("/talukas/:district_name", async (c) => {
    try {
      const district_name = c.req.param("district_name");
      const talukas = await fetchTalukas(district_name);
      return c.json({ success: true, data: { talukas } });
    } catch (error) {
      console.error("Error fetching talukas:", error);
      return c.json({ success: false, error: "Failed to fetch talukas" }, 500);
    }
  })

  .get("/villages", async (c) => {
    try {
      const { state, district, taluka } = c.req.query();
      if (!state || !district || !taluka) {
        return c.json(
          { success: false, error: "State, District, and Taluka are required" },
          400,
        );
      }

      const villages = await fetchVillages(state, district, taluka);
      return c.json({ success: true, data: { villages } });
    } catch (error) {
      console.error("Error fetching villages:", error);
      return c.json({ success: false, error: "Failed to fetch villages" }, 500);
    }
  });

export default OrganizationInviteController;
