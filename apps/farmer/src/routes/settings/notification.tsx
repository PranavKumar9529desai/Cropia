import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useState, useEffect, useMemo } from "react";
import { apiClient } from "@/lib/rpc";
import { Bell, BellOff, Check, ChevronRight, Clock, ChevronLeft, Inbox, CircleCheck } from "lucide-react";
import { Button } from "@repo/ui/components/button";
import { cn } from "@repo/ui/lib";
import { formatDistanceToNow, isToday, isYesterday, startOfDay, subDays } from "date-fns";
import { toast } from "@repo/ui/components/sonner";

import { Badge } from "@repo/ui/components/badge";

export const Route = createFileRoute("/settings/notification")({
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
    if (yesterday.length > 0) groups.push({ title: "Yesterday", items: yesterday });
    if (earlier.length > 0) groups.push({ title: "Earlier", items: earlier });

    return groups;
  }, [notifications]);

  const unreadCount = notifications.filter((n) => !n.seen).length;

  return (
    <div className="container mx-auto max-w-7xl flex flex-col h-full bg-background font-brand animate-in fade-in duration-500">
      {/* Header : TODO intergrate with setting topbar */}
      {/* <div className="sticky top-0 z-20 bg-background/95 backdrop-blur-xl border-b px-4 py-3 sm:px-5 sm:py-4 flex items-center justify-between">
                <div className="flex items-center gap-2.5 sm:gap-3">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => router.history.back()}
                        className="rounded-full h-8 w-8 sm:h-9 sm:w-9 border border-border/50 hover:bg-accent transition-all duration-200"
                    >
                        <ChevronLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    </Button>
                    <div className="space-y-0.5 sm:space-y-1 text-left">
                        <h1 className="text-sm sm:text-base font-black tracking-tight text-foreground/90">Notifications</h1>
                        <div className="flex items-center gap-1.5 leading-none">
                            <span className={cn(
                                "h-1 w-1 rounded-full",
                                unreadCount > 0 ? "bg-primary animate-pulse" : "bg-muted-foreground"
                            )} />
                            <p className="text-[9px] sm:text-[10px] text-muted-foreground/60 font-medium uppercase tracking-wider">
                                {unreadCount > 0 ? `${unreadCount} new alerts` : "No new alerts"}
                            </p>
                        </div>
                    </div>
                </div>
                {unreadCount > 0 && (
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={markAllAsSeen}
                        className="rounded-full h-8 px-2.5 sm:px-3 border-primary/20 hover:bg-primary/5 text-primary text-[9px] sm:text-[10px] font-bold tracking-tight py-0"
                    >
                        <CircleCheck className="w-3 h-3 sm:w-3.5 sm:h-3.5 mr-1" />
                        Mark Read
                    </Button>
                )}
            </div> */}

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto px-4 py-4 sm:py-6 pb-24 space-y-6 sm:space-y-8 no-scrollbar *:min-h-[200px]">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-64 space-y-3">
            <div className="relative">
              <div className="h-8 w-8 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Bell className="w-3.5 h-3.5 text-primary/40" />
              </div>
            </div>
            <p className="text-[11px] text-muted-foreground/40 font-black tracking-widest uppercase animate-pulse">Syncing Alerts</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[50vh] text-center max-w-[200px] mx-auto opacity-50">
            <div className="relative mb-4">
              <div className="bg-accent/30 p-5 rounded-[2.5rem]">
                <Inbox className="w-10 h-10 text-muted-foreground/30" />
              </div>
            </div>
            <h3 className="text-base font-black text-foreground/70 tracking-tight">Inbox Empty</h3>
            <p className="text-[10px] text-muted-foreground/60 font-bold mt-1 uppercase tracking-widest">
              No notifications yet
            </p>
          </div>
        ) : (
          groupedNotifications.map((group) => (
            <div key={group.title} className="space-y-8">
              <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/30 ml-2">
                {group.title}
              </h2>
              <div className="space-y-6 min-h-[200px]">
                {group.items.map((notification) => (
                  <div
                    key={notification.id}
                    onClick={() => !notification.seen && markAsSeen(notification.id)}
                    className={cn(
                      "group relative flex items-start gap-4 sm:gap-5 p-4 sm:p-5 rounded-2xl transition-all duration-300 border cursor-pointer",
                      !notification.seen
                        ? "bg-primary/[0.025] border-primary/10 hover:bg-primary/[0.05]"
                        : "bg-card border-border/50 hover:bg-accent/40"
                    )}
                  >
                    {/* Status Indicator Bar */}
                    {!notification.seen && (
                      <div className="absolute left-0 top-4 bottom-4 w-1 bg-primary rounded-r-full" />
                    )}

                    {/* Image on the Left */}
                    <div className="shrink-0 relative">
                      {notification.imageUrl ? (
                        <div className="size-20 sm:size-24 rounded-xl overflow-hidden border border-border/40 bg-muted/20">
                          <img
                            src={notification.imageUrl}
                            alt=""
                            className="w-full h-full object-cover grayscale-[0.2] group-hover:grayscale-0 transition-all duration-500 group-hover:scale-110"
                          />
                        </div>
                      ) : (
                        <div className={cn(
                          "size-16 sm:size-20 rounded-xl flex items-center justify-center transition-all duration-300",
                          !notification.seen
                            ? "bg-primary text-white shadow-lg shadow-primary/20"
                            : "bg-muted/50 text-muted-foreground/30"
                        )}>
                          <Bell className={cn("w-5 h-5 sm:w-6 sm:h-6", !notification.seen && "fill-white/20")} />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0 flex flex-col justify-center min-h-[4rem] sm:min-h-[5rem]">
                      <div className="flex items-center justify-between gap-2 sm:gap-3 mb-1 sm:mb-2">
                        <div className="flex items-center gap-2 sm:gap-2.5">
                          {notification.from && (
                            <Badge variant="outline" className="text-[10px] sm:text-[12px] h-6 sm:h-6 font-primary uppercase tracking-tight rounded-md bg-muted-foreground text-background border-none px-1.5 sm:px-2 leading-none">
                              {notification.from.organizationName || "Cropia"}
                            </Badge>
                          )}
                          <span className="text-[9px] sm:text-[10px] text-muted-foreground/50 font-bold tracking-tight">
                            {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                          </span>
                        </div>
                        <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-muted-foreground/10 group-hover:text-primary transition-all duration-300 group-hover:translate-x-0.5" />
                      </div>

                      <div className="space-y-0.5 sm:space-y-1">
                        <h4 className={cn(
                          "text-[13px] sm:text-[15px] font-black leading-tight tracking-tight",
                          !notification.seen ? "text-foreground" : "text-foreground/80"
                        )}>
                          {notification.title}
                        </h4>
                        <p className={cn(
                          "text-[12px] sm:text-sm leading-relaxed line-clamp-2",
                          !notification.seen ? "text-foreground/60 font-medium" : "text-muted-foreground/50"
                        )}>
                          {notification.body}
                        </p>

                        {notification.from && (
                          <div className="flex items-center gap-1.5 sm:gap-2 mt-1.5 sm:mt-2">
                            <span className="text-[9px] sm:text-[10px] font-bold text-muted-foreground/30  tracking-[0.1em] leading-none">
                              By {notification.from.name}
                            </span>

                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
