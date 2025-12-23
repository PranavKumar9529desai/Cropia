import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getMessaging } from 'firebase-admin/messaging';

const serviceAccountVal = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
const serviceAccountPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;

export const initFirebaseAdmin = () => {
    if (getApps().length === 0) {
        let credential;

        if (serviceAccountVal) {
            try {
                // Check if it's base64 encoded (basic check: no curly braces at format start/end)
                // or just try parsing. If parsing fails, try decoding base64.
                let jsonString = serviceAccountVal;
                if (!jsonString.trim().startsWith('{')) {
                    jsonString = Buffer.from(serviceAccountVal, 'base64').toString('utf-8');
                }
                const serviceAccount = JSON.parse(jsonString);
                credential = cert(serviceAccount);
            } catch (e) {
                console.error("Failed to parse GOOGLE_SERVICE_ACCOUNT_JSON", e);
            }
        } else if (serviceAccountPath) {
            credential = cert(serviceAccountPath);
        }

        if (credential) {
            initializeApp({
                credential: credential,
            });
        } else {
            console.warn(
                'Missing GOOGLE_SERVICE_ACCOUNT_JSON or GOOGLE_APPLICATION_CREDENTIALS. Firebase Admin not initialized.'
            );
        }
    }
};

export const getFirebaseMessaging = () => {
    initFirebaseAdmin();
    return getMessaging();
}

