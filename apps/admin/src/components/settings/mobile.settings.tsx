import { Link, Outlet, useChildMatches, useLocation, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, ChevronRight, LogOut, X } from "lucide-react";
import { Button } from "@repo/ui/components/button";
import { authClient } from "@/lib/auth/auth-client";
import { toast } from "@repo/ui/components/sonner";
import { settingsRoutes, type SettingsRoute } from "./settings.constants";

export const SettingsMobileLayout = ({
  routes,
}: {
  routes: SettingsRoute[];
}) => {
  const matches = useChildMatches();
  const location = useLocation();
  const navigate = useNavigate();

  // Check if we are on the root settings page
  const isRoot = matches.length === 0;

  // Find the current route title
  const currentRoute = routes.find((r) => r.href === location.pathname);

  return (
    <div className="flex flex-col h-full md:hidden">
      {isRoot ? <SettingRouteComponent /> : (
        <div>
          <div className="flex items-center justify-between px-2 py-3 border-b bg-background sticky top-0 z-10">
            <div className="flex items-center gap-3">
              {currentRoute?.icon && (
                <currentRoute.icon className="w-5 h-5 text-muted-foreground" />
              )}
              <h1 className="font-bold text-lg">
                {currentRoute?.title || "Settings"}
              </h1>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full h-8 w-8 hover:bg-muted"
              onClick={() => navigate({ to: "/dashboard/settings" })}
            >
              <X className="w-5 h-5" />
            </Button>

          </div>
          <div className="flex-1 h-full mt-10 container px-2">
            <Outlet />
          </div>
        </div>
      )}


    </div>
  );
};




const SettingRouteComponent = () => {
  const navigate = useNavigate()
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


  return <div className="flex flex-col gap-4 p-4 ">
    <div className="flex items-center gap-2 mb-4">
      <Button
        variant="ghost"
        size="icon"
        className="h-9 w-9 rounded-full -ml-2"
        asChild
      >
        <Link to="/dashboard">
          <ArrowLeft className="h-5 w-5" />
        </Link>
      </Button>
      <div>
        <h1 className="text-2xl font-bold font-brand">Settings</h1>
        <span className="text-muted-foreground text-sm font-brand">
          Manage your app settings
        </span>
      </div>
    </div>
    {settingsRoutes.map((route) => (
      <Link
        key={route.href}
        to={route.href}
        className="flex items-center justify-between p-4  rounded-2xl hover:bg-accent/50 transition-colors h-10"
      >
        <div className="flex items-center gap-2">
          <div className="p-3 rounded-xl text-primary">
            <route.icon className="w-5 h-5" />
          </div>
          <span className="font-semibold text-lg">{route.title}</span>
        </div>
        <div className="p-2 text-muted-foreground">
          <ChevronRight className="w-5 h-5" />
        </div>
      </Link>
    ))}

    <div className="p-4 mt-auto ">
      <Button
        variant="ghost"
        className="w-full h-auto text-destructive flex justify-start"
        onClick={handleLogout}
      >
        <div className="flex items-center gap-4 ">
          <div className="">
            <LogOut className="w-5 h-5" />
          </div>
          <span className="font-semibold text-lg">Log Out</span>
        </div>
      </Button>
    </div>
  </div>
}