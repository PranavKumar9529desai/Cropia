import { auth } from "../auth";

async function main() {
    console.log("🚀 Starting setup script...");

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

        const setCookie = res.headers.get("set-cookie");
        if (setCookie) {
            headers.set("cookie", setCookie);
            console.log("✅ Authenticated successfully.");
        } else {
            console.warn("⚠️ No session cookie returned. Operations requiring auth might fail.");
        }

    } catch (e) {
        console.error("❌ Auth Error:", e);
        return;
    }

    // 2. Create Organization
    let orgId: string | null = null;
    try {
        console.log(`🏢 Creating organization: ${orgName}`);
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
        // If org already exists, find it
        console.log("⚠️ Creation might have failed or org exists. Fetching existing orgs...");
        const orgs = await auth.api.listOrganizations({ headers });
        const existing = orgs?.find(o => o.slug === orgSlug);
        if (existing) {
            orgId = existing.id;
            console.log(`✅ Found existing organization: ${existing.id}`);
        } else {
            console.error("❌ Failed to create or find organization.", e?.message || e);
        }
    }

    if (!orgId) return;

    // 3. Send Invitation with Jurisdiction
    try {
        console.log(`📩 Sending invitation to: ${inviteEmail}`);

        // Using the BetterAuth API
        // NOTE: We are passing 'jurisdiction' in the body.
        // For this to work, we need to ensure BetterAuth passes extra fields to the DB adapter or plugin hook.
        // Since we explicitly added 'jurisdiction' to the Invitation model in Schema, the Prisma Adapter *should* pick it up 
        // IF we type-cast or if BetterAuth allows generic object passing.

        const invitation = await auth.api.createInvitation({
            body: {
                email: inviteEmail,
                role: "admin", // as member table is only consist of the admin and owner , as the farmers records are not in the oraganization
                organizationId: orgId,
                // @ts-expect-error
                jurisdiction: {
                    state: "Maharashtra",
                    district: "Satara",
                    taluka: "Karad",
                    village: "All"
                }
            },
            headers
        });

        if (invitation) {
            console.log("✅ Invitation sent successfully!");
            console.log("Metadata/Jurisdiction attached to invite:", (invitation as any).jurisdiction);
        } else {
            console.error("❌ Failed to send invitation.");
        }

    } catch (e) {
        console.error("❌ Invitation Error:", e);
    }
}

main().catch(console.error);
