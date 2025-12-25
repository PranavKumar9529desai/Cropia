import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { apiClient } from "@/lib/rpc";
import { Bell, BellOff, Check, ChevronRight, Clock, ChevronLeft } from "lucide-react";
import { Button } from "@repo/ui/components/button";
import { cn } from "@repo/ui/lib";
import { formatDistanceToNow } from "date-fns";
import { toast } from "@repo/ui/components/sonner";

export const Route = createFileRoute("/dashboard/_settings/settings/notification")({
    component: NotificationsPage,
});

type Notification = {
    id: string;
    title: string;
    body: string;
    imageUrl?: string | null;
    seen: boolean;
    createdAt: string;
};

function NotificationsPage() {
    const router = useRouter();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchNotifications = async () => {
        setIsLoading(true);
        try {
            const res = await apiClient.api.notifications.$get();
            if (res.ok) {
                const data = await res.json();
                if ("notifications" in data) {
                    setNotifications(data.notifications as Notification[]);
                }
            }
        } catch (error) {
            console.error("Failed to fetch notifications", error);
        } finally {
            setIsLoading(false);
        }
    };

    const markAllAsSeen = async () => {
        try {
            const res = await apiClient.api.notifications["mark-seen"].$post({
                json: {},
            });
            if (res.ok) {
                setNotifications((prev) => prev.map((n) => ({ ...n, seen: true })));
                toast.success("All notifications marked as read");
            }
        } catch (error) {
            console.error("Failed to mark all as seen", error);
        }
    };

    const markAsSeen = async (id: string) => {
        try {
            const res = await apiClient.api.notifications["mark-seen"].$post({
                json: { notificationId: id },
            });
            if (res.ok) {
                setNotifications((prev) =>
                    prev.map((n) => (n.id === id ? { ...n, seen: true } : n))
                );
            }
        } catch (error) {
            console.error("Failed to mark as seen", error);
        }
    };

    useEffect(() => {
        fetchNotifications();
    }, []);

    const unreadCount = notifications.filter((n) => !n.seen).length;

    return (
        <div className="flex flex-col h-full bg-background font-brand">
            {/* Header */}
            <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b px-4 py-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => router.history.back()}
                        className="rounded-full h-9 w-9 -ml-1 border bg-background/50"
                    >
                        <ChevronLeft className="w-5 h-5 pointer-events-none" />
                    </Button>
                    <div className="bg-primary/10 p-2 rounded-full hidden sm:block">
                        <Bell className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold tracking-tight">Notifications</h1>
                        <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">
                            {unreadCount > 0 ? `${unreadCount} unread messages` : "All caught up!"}
                        </p>
                    </div>
                </div>
                {unreadCount > 0 && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={markAllAsSeen}
                        className="text-primary hover:text-primary/80 hover:bg-primary/5 text-xs font-bold"
                    >
                        <Check className="w-3.5 h-3.5 mr-1" />
                        Mark all read
                    </Button>
                )}
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto pb-20">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center h-64 space-y-4">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                        <p className="text-sm text-muted-foreground animate-pulse">Fetching alerts...</p>
                    </div>
                ) : notifications.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-96 px-8 text-center bg-gray-50/30">
                        <div className="bg-gray-100 p-6 rounded-full mb-4">
                            <BellOff className="w-10 h-10 text-muted-foreground/40" />
                        </div>
                        <h3 className="text-lg font-bold text-foreground/80">No notifications yet</h3>
                        <p className="text-sm text-muted-foreground max-w-[240px] mt-1">
                            When you receive alerts from the admin, they will appear here.
                        </p>
                    </div>
                ) : (
                    <div className="divide-y divide-border/50">
                        {notifications.map((notification) => (
                            <div
                                key={notification.id}
                                onClick={() => !notification.seen && markAsSeen(notification.id)}
                                className={cn(
                                    "flex items-start gap-4 p-4 transition-all duration-200 cursor-pointer active:scale-[0.98]",
                                    !notification.seen ? "bg-primary/5 hover:bg-primary/10" : "hover:bg-accent/40"
                                )}
                            >
                                <div className="relative shrink-0 mt-1">
                                    <div className={cn(
                                        "w-10 h-10 rounded-xl flex items-center justify-center shadow-sm",
                                        !notification.seen ? "bg-primary text-white" : "bg-accent text-muted-foreground"
                                    )}>
                                        <Bell className="w-5 h-5" />
                                    </div>
                                    {!notification.seen && (
                                        <span className="absolute -top-1 -right-1 flex h-3 w-3">
                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                                            <span className="relative inline-flex rounded-full h-3 w-3 bg-primary border-2 border-white"></span>
                                        </span>
                                    )}
                                </div>

                                <div className="flex-1 min-w-0 space-y-1">
                                    <div className="flex items-center justify-between gap-2">
                                        <h4 className={cn(
                                            "text-sm font-bold truncate",
                                            !notification.seen ? "text-foreground" : "text-foreground/70"
                                        )}>
                                            {notification.title}
                                        </h4>
                                        <div className="flex items-center text-[10px] text-muted-foreground font-medium whitespace-nowrap">
                                            <Clock className="w-3 h-3 mr-1" />
                                            {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                                        </div>
                                    </div>
                                    <p className={cn(
                                        "text-[13px] leading-relaxed line-clamp-2",
                                        !notification.seen ? "text-foreground/90 font-medium" : "text-muted-foreground"
                                    )}>
                                        {notification.body}
                                    </p>

                                    {notification.imageUrl && (
                                        <div className="mt-2 rounded-lg overflow-hidden border border-border/50 aspect-video w-full max-w-[200px]">
                                            <img
                                                src={notification.imageUrl}
                                                alt=""
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                    )}
                                </div>

                                <div className="self-center opacity-20 group-hover:opacity-100 transition-opacity">
                                    <ChevronRight className="w-4 h-4" />
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
