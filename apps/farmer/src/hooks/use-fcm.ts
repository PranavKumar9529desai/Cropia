import { useEffect } from "react";
import { requestPermission, onMessageListener } from "../lib/firebase";
import { apiClient } from "@/lib/rpc";
import { toast } from "@repo/ui/components/sonner";

export const useFCM = () => {
    useEffect(() => {
        console.log("DEBUG: useFCM mounted");
        const initFCM = async () => {
            console.log("DEBUG: Requesting permission...");
            const token = await requestPermission();
            console.log("DEBUG: Permission result:", token ? "Granted" : "Denied");
            if (token) {
                // Send token to backend
                try {
                    const response = await apiClient.api.notifications["register-device"].$post({
                        json: {
                            token,
                            platform: "web",
                        },
                    });

                    if (!response.ok) {
                        console.error("Failed to register device token");
                    }
                } catch (error) {
                    console.error("Error sending token to backend:", error);
                }
            }
        };

        initFCM();

        // Check SW status
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.getRegistrations().then(registrations => {
                console.log("DEBUG: SW Registrations:", registrations);
                if (registrations.length === 0) {
                    console.warn("DEBUG: No Service Worker found! Notifications might fail.");
                }
            });
        }

        // Test Toast
        // setTimeout(() => toast.success("Test Toast: Notification System Active"), 2000);

        // Listen for foreground messages
        const unsubscribe = onMessageListener((payload: any) => {
            console.log("DEBUG: Foreground message received:", payload);
            toast.message(payload?.notification?.title || "New Notification", {
                description: payload?.notification?.body,
            });
        });

        return () => {
            if (unsubscribe) unsubscribe();
        };

    }, []);
};
