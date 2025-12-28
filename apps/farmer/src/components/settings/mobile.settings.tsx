import { SettingsRoute } from "@/routes/dashboard/settings/route";
import { Outlet, useLocation, useNavigate } from "@tanstack/react-router";
import { X } from "lucide-react";
import { Button } from "@repo/ui/components/button";

export const SettingsMobileLayout = ({
  routes,
}: {
  routes: SettingsRoute[];
}) => {
  const location = useLocation();
  const navigate = useNavigate();

  // Check if we are on the root settings page
  const isRoot =
    location.pathname === "/dashboard/settings" ||
    location.pathname === "/dashboard/settings/";

  // Find the current route title
  const currentRoute = routes.find((r) => r.href === location.pathname);

  return (
    <div className="flex flex-col h-full md:hidden">
      {!isRoot && (
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
      )}

      {/* Content Area */}
      <div className="flex-1 h-full mt-10 container px-2">
        <Outlet />
      </div>
    </div>
  );
};
