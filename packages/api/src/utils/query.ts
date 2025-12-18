import { auth } from "../auth";

async function main() {
    console.log("🚀 Starting Cropia Setup Script...");

    const email = "fullstackwebdeveloper123@gmail.com";
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
            asResponse: true
        });

        if (!res.ok) {
            console.log("⚠️ Signup failed (user likely exists). Attempting login...");
            res = await auth.api.signInEmail({
                body: { email, password },
                asResponse: true
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
            headers
        });

        if (org) {
            orgId = org.id;
            console.log(`✅ Organization created: ${org.id}`);
        }
    } catch (e: any) {
        console.log("⚠️ Creation failed or organization already exists. Searching...");

        const orgs = await auth.api.listOrganizations({ headers });
        const existing = orgs?.find(o => o.slug === orgSlug);

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

        const invitation = await auth.api.createInvitation({
            body: {
                email: inviteEmail,
                role: "admin",
                organizationId: orgId as string,
                // This object will be handled by our 'databaseHooks' in auth.ts
                jurisdiction: {
                    state: "Maharashtra",
                    district: "Satara",
                    taluka: "Karad",
                    village: "All"
                }
            } as any, // Cast to any to allow custom fields in the API call
            headers
        });

        if (invitation) {
            console.log("✅ Invitation sent successfully!");
            // Log the jurisdiction to confirm it was processed
            console.log("📍 Assigned Jurisdiction:", (invitation as any).jurisdiction);
        } else {
            console.error("❌ Invitation object was not returned.");
        }

    } catch (e: any) {
        // Detailed error logging to help debug Prisma/BetterAuth issues
        console.error("❌ Invitation Error:", e?.message || e);
        if (e?.body) console.error("Error Body:", e.body);
    }
}

main().catch((err) => {
    console.error("💥 Critical Script Failure:", err);
    process.exit(1);
});