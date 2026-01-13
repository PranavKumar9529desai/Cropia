import { adminAuth, auth, farmerAuth } from "../auth";

async function main() {
    console.log("🚀 Starting Invitation Script...");

    const email = "pranavkdesai1@gmail.com";
    const password = "Intern@31";
    const inviteEmail = "tootahawa18@gmail.com";
    let headers = new Headers();

    // 1. Authenticate
    try {
        console.log(`🔐 Authenticating as: ${email}`);
        const res = await auth.api.signInEmail({
            body: { email, password },
            asResponse: true,
        });

        if (!res.ok) {
            const error = await res.json();
            throw new Error(`Authentication failed: ${JSON.stringify(error)}`);
        }

        // Capture session cookie
        const setCookie = res.headers.get("set-cookie");
        if (setCookie) {
            headers.set("cookie", setCookie);
            console.log("✅ Authenticated and session cookie captured.");
        } else {
            console.warn("⚠️ No session cookie received. Subsequent requests might fail.");
        }
    } catch (e: any) {
        console.error("❌ Auth Error:", e.message || e);
        return;
    }

    // 2. Resolve Organization
    let targetOrgId: string | null = null;
    try {
        console.log("📂 Fetching organizations...");
        const orgs = await auth.api.listOrganizations({ headers });

        if (!orgs || orgs.length === 0) {
            console.error("❌ No organizations found for this user. Please create one first.");
            return;
        }

        // Use the first organization as requested (user mentioned they only have one)
        targetOrgId = orgs[0].id;
        console.log(`🏢 Selected Organization: ${orgs[0].name} (ID: ${targetOrgId})`);
    } catch (e: any) {
        console.error("❌ Error fetching organizations:", e.message || e);
        return;
    }

    // 3. Send Invitation
    try {
        console.log(`📩 Sending invitation to: ${inviteEmail}`);

        const invitation = await adminAuth.api.createInvitation({
            body: {
                email: inviteEmail,
                role: "admin",
                organizationId: targetOrgId as string,
                // Custom jurisdiction data handled by auth hooks
                jurisdiction: {
                    state: "Punjab",
                    district: "Kapurthala",
                    taluka: "Phagwara",
                    village: "University Campus Nanak Nagri",
                },
            } as any,
            headers,
        });

        if (invitation) {
            console.log("✅ Invitation sent successfully!");
            console.log("📍 Assigned Jurisdiction:", (invitation as any).jurisdiction);
        } else {
            console.error("❌ Invitation object was not returned.");
        }
    } catch (e: any) {
        console.error("❌ Invitation Error:", e?.message || e);
        if (e?.body) console.error("Error Body:", JSON.stringify(e.body, null, 2));
    }
}

main().catch((err) => {
    console.error("💥 Script Failure:", err);
    process.exit(1);
});
