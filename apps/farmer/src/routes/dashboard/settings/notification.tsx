import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useMemo } from "react";
import { apiClient } from "@/lib/rpc";
import { Bell, Inbox, CheckCircle } from "lucide-react";
import { Button } from "@repo/ui/components/button";
import { cn } from "@repo/ui/lib";
import { formatDistanceToNow, isToday, isYesterday } from "date-fns";
import { toast } from "@repo/ui/components/sonner";

import { Badge } from "@repo/ui/components/badge";

export const Route = createFileRoute("/dashboard/settings/notification")({
  component: NotificationsPage,
});

type Notification = {
  id: string;
  title: string;
  body: string;
  imageUrl?: string | null;
  from?: {
    name: string;
    organizationName?: string | null;
    jurisdiction?: string | null;
  } | null;
  seen: boolean;
  createdAt: string;
};

interface NotificationGroup {
  title: string;
  items: Notification[];
}

function NotificationsPage() {
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
          prev.map((n) => (n.id === id ? { ...n, seen: true } : n)),
        );
      }
    } catch (error) {
      console.error("Failed to mark as seen", error);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const groupedNotifications = useMemo(() => {
    const groups: NotificationGroup[] = [];
    const today: Notification[] = [];
    const yesterday: Notification[] = [];
    const earlier: Notification[] = [];

    notifications.forEach((n) => {
      const date = new Date(n.createdAt);
      if (isToday(date)) today.push(n);
      else if (isYesterday(date)) yesterday.push(n);
      else earlier.push(n);
    });

    if (today.length > 0) groups.push({ title: "Today", items: today });
    if (yesterday.length > 0)
      groups.push({ title: "Yesterday", items: yesterday });
    if (earlier.length > 0) groups.push({ title: "Earlier", items: earlier });

    return groups;
  }, [notifications]);

  const unreadCount = notifications.filter((n) => !n.seen).length;

  return (
    <div className="w-full max-w-7xl space-y-8 pb-10">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left Column: Title & Description */}
        <div className="lg:w-1/3 space-y-4">
          <div className="space-y-2">
            <h3 className="text-lg font-medium">Notifications</h3>
            <p className="text-sm text-muted-foreground">
              Manage your alerts and staying updated with the latest from
              Cropia.
            </p>
          </div>

          {unreadCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={markAllAsSeen}
              className="w-full sm:w-auto gap-2"
            >
              <CheckCircle className="w-4 h-4" />
              Mark all as read
            </Button>
          )}
        </div>

        {/* Right Column: Notification List */}
        <div className="lg:w-2/3 h-[calc(100vh-12rem)] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">
          <div className="space-y-6">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-12 space-y-4">
                <div className="h-8 w-8 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
                <p className="text-sm text-muted-foreground animate-pulse">
                  Syncing Alerts...
                </p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 border rounded-lg bg-muted/10 border-dashed">
                <div className="p-4 rounded-full bg-muted mb-4">
                  <Inbox className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold">Inbox Empty</h3>
                <p className="text-sm text-muted-foreground mt-2">
                  You have no new notifications.
                </p>
              </div>
            ) : (
              groupedNotifications.map((group) => (
                <div key={group.title} className="space-y-4">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground pl-1">
                    {group.title}
                  </h4>
                  <div className="space-y-3">
                    {group.items.map((notification) => (
                      <div
                        key={notification.id}
                        onClick={() =>
                          !notification.seen && markAsSeen(notification.id)
                        }
                        className={cn(
                          "group relative flex items-start gap-4 p-4 rounded-xl transition-all duration-200 border cursor-pointer",
                          !notification.seen
                            ? "bg-primary/[0.03] border-primary/20 hover:bg-primary/[0.05]"
                            : "bg-card border-border hover:bg-accent/50",
                        )}
                      >
                        {!notification.seen && (
                          <div className="absolute left-0 top-4 bottom-4 w-1 bg-primary rounded-r-full" />
                        )}

                        <div className="shrink-0">
                          {notification.imageUrl ? (
                            <div className="size-24 rounded-lg overflow-hidden border bg-muted">
                              <img
                                src={notification.imageUrl}
                                alt=""
                                className="w-full h-full object-cover"
                              />
                            </div>
                          ) : (
                            <div
                              className={cn(
                                "h-16 w-16 rounded-lg flex items-center justify-center transition-colors",
                                !notification.seen
                                  ? "bg-primary/10 text-primary"
                                  : "bg-muted text-muted-foreground",
                              )}
                            >
                              <Bell className="w-5 h-5" />
                            </div>
                          )}
                        </div>

                        <div className="flex-1 min-w-0 space-y-1">
                          <div className="flex items-start justify-between gap-2">
                            <div className="space-y-0.5">
                              <h4
                                className={cn(
                                  "text-sm font-semibold leading-none",
                                  !notification.seen
                                    ? "text-foreground"
                                    : "text-foreground/80",
                                )}
                              >
                                {notification.title}
                              </h4>
                              <p className="text-xs text-muted-foreground/60 font-medium">
                                {formatDistanceToNow(
                                  new Date(notification.createdAt),
                                  { addSuffix: true },
                                )}
                              </p>
                            </div>
                            {notification.from && (
                              <Badge
                                variant="outline"
                                className="text-[10px] h-5 px-1.5 uppercase tracking-wider font-medium text-muted-foreground bg-muted/50 border-border/50"
                              >
                                {notification.from.organizationName || "Cropia"}
                              </Badge>
                            )}
                          </div>

                          <p
                            className={cn(
                              "text-sm leading-relaxed line-clamp-2",
                              !notification.seen
                                ? "text-foreground/80"
                                : "text-muted-foreground",
                            )}
                          >
                            {notification.body}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
