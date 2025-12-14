import { auth } from "../auth";

async function main() {
    const email = "fullstackwebdeveloper123@gmail.com";
    const password = "password123";
    const name = "Admin User";

    console.log("Authenticating as Admin...");

    let headers = new Headers();

    try {
        // Try to sign up first
        const res = await auth.api.signUpEmail({
            body: {
                email,
                password,
                name,
            },
            asResponse: true,
        });
        const setCookie = res.headers.get("set-cookie");
        if (setCookie) headers.set("Cookie", setCookie);
        console.log("Signed up successfully.");
    } catch (e) {
        // If sign up fails (e.g. user exists), try sign in
        console.log("User might already exist, trying to sign in...");
        try {
            const res = await auth.api.signInEmail({
                body: {
                    email,
                    password,
                },
                asResponse: true,
            });
            const setCookie = res.headers.get("set-cookie");
            if (setCookie) headers.set("Cookie", setCookie);
            console.log("Signed in successfully.");
        } catch (signInError) {
            console.error("Failed to sign in:", signInError);
            return;
        }
    }

    console.log("Creating Organization...");
    const org = await auth.api.createOrganization({
        body: {
            name: "Cropia HQ",
            slug: "cropia-hq-" + Math.floor(Math.random() * 10000),
        },
        headers,
    });

    if (!org) {
        console.error("Failed to create organization.");
        return;
    }
    console.log(`Organization created: ${org.name} (${org.id})`);

    console.log("Sending Invitation...");
    const invite = await auth.api.createInvitation({
        body: {
            email: "dpranav7745@gmail.com",
            role: "member",
            organizationId: org.id,
        },
        headers,
    });

    if (invite) {
        console.log("Invitation sent successfully to dpranav7745@gmail.com");
    } else {
        console.error("Failed to send invitation.");
    }
}

main().catch(console.error);
