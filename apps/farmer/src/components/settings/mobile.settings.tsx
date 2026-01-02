import { SettingsRoute, settingsRoutes } from "@/routes/dashboard/settings/route";
import { Link, Outlet, useChildMatches, useLocation, useNavigate } from "@tanstack/react-router";
import { ChevronRight, LogOut, X, Moon, User } from "lucide-react";
import { Button } from "@repo/ui/components/button";
import { authClient } from "@/lib/auth/auth-client";
import { toast } from "@repo/ui/components/sonner";
import { ModeToggle } from "../theme-toggle";
import { Avatar, AvatarFallback, AvatarImage } from "@repo/ui/components/avatar";
import { Card, CardContent } from "@repo/ui/components/card";

export const SettingsMobileLayout = ({
  routes,
}: {
  routes: SettingsRoute[];
}) => {
  const matches = useChildMatches();
  const location = useLocation();
  const navigate = useNavigate();

  // Check if we are on the root settings page
  const isRoot = matches.length === 0 || matches.some(m => m.routeId === '/dashboard/settings/');

  // Find the current route title
  const currentRoute = routes.find((r) => r.href === location.pathname);

  return (
    <div className="flex flex-col   md:hidden ">
      <div className="flex items-center justify-between px-3 py-4  bg-background border-b sticky top-0 z-20">
        <h1 className="text-xl font-bold font-brand tracking-tight z-10">
          {isRoot ? "Settings" : (currentRoute?.title || "Settings")}
        </h1>
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full h-8 w-8"
          onClick={() => isRoot ? navigate({ to: "/dashboard" }) : navigate({ to: "/dashboard/settings" })}
        >
          <X className="w-5 h-5 text-muted-foreground" />
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto pb-24">
        {isRoot ? <SettingRouteComponent /> : (
          <div className="p-4">
            <Outlet />
          </div>
        )}
      </div>
    </div>
  );
};

const SettingRouteComponent = () => {
  const { data: session } = authClient.useSession();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          toast.success("Logged out successfully");
          navigate({ to: "/sign-in" });
        },
        onError: () => {
          toast.error("Failed to logout");
        }
      },
    });
  };

  const user = session?.user;

  return (
    <div className="p-4 space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
      {/* Profile Section */}
      <Card className="border-none shadow-sm overflow-hidden bg-background">
        <CardContent className="p-4 flex items-center gap-4">
          <Avatar className="h-14 w-14 border-2 border-primary/10">
            <AvatarImage src={user?.image || ""} />
            <AvatarFallback className="bg-primary/5 text-primary">
              <User className="w-6 h-6" />
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <h2 className="font-bold text-lg truncate">{user?.name}</h2>
            <p className="text-sm text-muted-foreground truncate">{user?.email}</p>
          </div>
        </CardContent>
      </Card>

      {/* Settings Grid */}
      <div className="space-y-4">
        <div className="px-1">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/80 mb-2 ml-1">General</h3>
          <Card className="border-none shadow-sm overflow-hidden bg-background">
            <div className="divide-y divide-border/40">
              {settingsRoutes.map((route) => (
                <Link
                  key={route.href}
                  to={route.href}
                  className="flex items-center justify-between p-4 hover:bg-accent/50 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-primary/5 text-primary group-hover:bg-primary/10 transition-colors">
                      <route.icon className="w-5 h-5" />
                    </div>
                    <span className="font-medium text-base">{route.title}</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground/50" />
                </Link>
              ))}
            </div>
          </Card>
        </div>

        <div className="px-1">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/80 mb-2 ml-1">Appearance</h3>
          <Card className="border-none shadow-sm overflow-hidden bg-background">
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-primary/5 text-primary">
                  <Moon className="w-5 h-5" />
                </div>
                <div className="flex flex-col">
                  <span className="font-medium text-base">Theme</span>
                  <span className="text-xs text-muted-foreground">Adjust your view</span>
                </div>
              </div>
              <ModeToggle />
            </div>
          </Card>
        </div>

        <div className="px-1 pt-2">
          <Button
            variant="ghost"
            className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/5 h-12 rounded-xl border-none shadow-none"
            onClick={handleLogout}
          >
            <div className="flex items-center gap-3 w-full">
              <div className="p-2 rounded-xl bg-destructive/5">
                <LogOut className="w-5 h-5" />
              </div>
              <span className="font-semibold text-base">Log Out</span>
            </div>
          </Button>
        </div>
      </div>
    </div>
  );
}