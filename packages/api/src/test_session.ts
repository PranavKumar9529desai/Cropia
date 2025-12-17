
import { auth } from "./auth";

async function main() {
    console.log("🚀 Testing Session Callback...");

    const email = "fullstackwebdeveloper123@gmail.com";
    const password = "Intern@31";

    // 1. Authenticate to get a valid session
    const res = await auth.api.signInEmail({
        body: { email, password },
        asResponse: true
    });

    const setCookie = res.headers.get("set-cookie");
    if (!setCookie) {
        console.error("❌ Failed to get session cookie");
        return;
    }

    const headers = new Headers();
    headers.set("cookie", setCookie);

    console.log("✅ Signed in. Fetching session...");

    // 2. Fetch Session to trigger callback
    const session = await auth.api.getSession({
        headers: headers
    });

    console.log("Session Result:", JSON.stringify(session, null, 2));
}

main().catch(console.error);
