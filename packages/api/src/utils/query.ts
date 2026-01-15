import { auth } from "../auth";

async function main() {
  console.log("🚀 Starting Cropia Setup Script...");

  const email = "pranavkdesai1@gmail.com";
  const password = "Intern@31";
  const name = "Admin User";

  const inviteEmail = "dpranav7745@gmail.com";
  const orgName = "Maharashtra Agro Department";
  const orgSlug = "maharashtra-agro-department";

  let headers = new Headers();

  // 1. Authenticate (Signup or Signin)
  try {
    console.log(`🔐 Authenticating user: ${email}`);

    let res = await auth.api.signUpEmail({
      body: { email, password, name },
      asResponse: true,
    });

    if (!res.ok) {
      console.log("⚠️ Signup failed (user likely exists). Attempting login...");
      res = await auth.api.signInEmail({
        body: { email, password },
        asResponse: true,
      });
    }

    if (!res.ok) {
      const error = await res.json();
      throw new Error(`Authentication failed: ${JSON.stringify(error)}`);
    }

    // Better Auth uses cookies for session management
    const setCookie = res.headers.get("set-cookie");
    if (setCookie) {
      headers.set("cookie", setCookie);
      console.log("✅ Authenticated and session cookie captured.");
    }
  } catch (e) {
    console.error("❌ Auth Error:", e);
    return;
  }

  // 2. Create Organization
  let orgId: string | null = null;
  try {
    console.log(`🏢 Creating organization: ${orgName}`);

    // Passing headers is crucial for the API to know who is making the request
    const org = await auth.api.createOrganization({
      body: {
        name: orgName,
        slug: orgSlug,
      },
      headers,
    });

    if (org) {
      orgId = org.id;
      console.log(`✅ Organization created: ${org.id}`);
    }
  } catch (error) {
    console.log(
      "⚠️ Creation failed or organization already exists. Searching...",
    );

    const orgs = await auth.api.listOrganizations({ headers });
    const existing = orgs?.find((o) => o.slug === orgSlug);

    if (existing) {
      orgId = existing.id;
      console.log(`✅ Found existing organization: ${existing.id}`);
    } else {
      console.error("❌ Could not resolve Organization ID.");
      return;
    }
  }

  // 3. Send Invitation with Jurisdiction
  try {
    console.log(`📩 Sending invitation to: ${inviteEmail}`);

    const invitation = await (auth.api as any).createInvitation({
      body: {
        email: inviteEmail,
        role: "admin",
        organizationId: orgId as string,
        // This object will be handled by our 'databaseHooks' in auth.ts
        jurisdiction: {
          state: "Maharashtra",
          district: "Satara",
          taluka: "Karad",
          village: "All",
        },
      },
      headers,
    });

    if (invitation) {
      console.log("✅ Invitation sent successfully!");
      // Log the jurisdiction to confirm it was processed
      console.log(
        "📍 Assigned Jurisdiction:",
        (invitation as Record<string, unknown>).jurisdiction,
      );
    } else {
      console.error("❌ Invitation object was not returned.");
    }
  } catch (error) {
    // Detailed error logging to help debug Prisma/BetterAuth issues
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("❌ Invitation Error:", errorMessage);
    if (error && typeof error === "object" && "body" in error)
      console.error("Error Body:", (error as any).body);
  }
}

main().catch((err) => {
  console.error("💥 Critical Script Failure:", err);
  process.exit(1);
});

//
