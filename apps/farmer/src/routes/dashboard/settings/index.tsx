import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { settingsRoutes } from "./route";
import { useIsMobile } from "@repo/ui/hooks/use-mobile";
import { useEffect } from "react";
import { ChevronRight, ArrowLeft, LogOut } from "lucide-react";
import { Button } from "@repo/ui/components/button";
import { authClient } from "@/lib/auth/auth-client";
import { toast } from "@repo/ui/components/sonner";

export const Route = createFileRoute("/dashboard/settings/")({
  component: RouteComponent,
});

function RouteComponent() {
  // TOOD : move to before load
  const isMobile = useIsMobile();
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

  useEffect(() => {
    if (!isMobile) {
      // navigate({ to: '/dashboard/settings/account' })
    }
  }, [isMobile, navigate]);

  if (!isMobile) return null;

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex items-center gap-2 mb-10 relative bottom-10 right-4">
        <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full ">
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
  );
}
