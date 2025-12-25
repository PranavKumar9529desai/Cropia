import { useState, useEffect, useCallback } from "react";
import { apiClient } from "@/lib/rpc";

export type Notification = {
    id: string;
    title: string;
    body: string;
    imageUrl?: string | null;
    seen: boolean;
    createdAt: string;
};

export function useNotifications() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isLoading, setIsLoading] = useState(true);

    const fetchUnreadCount = useCallback(async () => {
        try {
            const res = await apiClient.api.notifications["unread-count"].$get();
            if (res.ok) {
                const data = await res.json();
                if ("count" in data) {
                    setUnreadCount(data.count as number);
                }
            }
        } catch (error) {
            console.error("Failed to fetch unread count", error);
        }
    }, []);

    const fetchNotifications = useCallback(async () => {
        setIsLoading(true);
        try {
            const res = await apiClient.api.notifications.$get();
            if (res.ok) {
                const data = await res.json();
                if ("notifications" in data) {
                    const fetchedNotifications = data.notifications as Notification[];
                    setNotifications(fetchedNotifications);
                    setUnreadCount(fetchedNotifications.filter(n => !n.seen).length);
                }
            }
        } catch (error) {
            console.error("Failed to fetch notifications", error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const markAsSeen = async (id: string) => {
        try {
            const res = await apiClient.api.notifications["mark-seen"].$post({
                json: { notificationId: id },
            });
            if (res.ok) {
                setNotifications((prev) =>
                    prev.map((n) => (n.id === id ? { ...n, seen: true } : n))
                );
                setUnreadCount((prev) => Math.max(0, prev - 1));
            }
        } catch (error) {
            console.error("Failed to mark as seen", error);
        }
    };

    const markAllAsSeen = async () => {
        try {
            const res = await apiClient.api.notifications["mark-seen"].$post({
                json: {},
            });
            if (res.ok) {
                setNotifications((prev) => prev.map((n) => ({ ...n, seen: true })));
                setUnreadCount(0);
            }
        } catch (error) {
            console.error("Failed to mark all as seen", error);
        }
    };

    useEffect(() => {
        fetchUnreadCount();
        // Refresh every minute
        const interval = setInterval(fetchUnreadCount, 60000);
        return () => clearInterval(interval);
    }, [fetchUnreadCount]);

    return {
        notifications,
        unreadCount,
        isLoading,
        fetchNotifications,
        fetchUnreadCount,
        markAsSeen,
        markAllAsSeen,
    };
}
