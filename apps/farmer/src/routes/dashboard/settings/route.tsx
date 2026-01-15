import { SettingsDesktopLayout } from "@/components/settings/desktop.settings";
import { SettingsMobileLayout } from "@/components/settings/mobile.settings";
import { SettingsRoutes } from "@/components/settings/settings.constants";
import { useIsMobile } from "@repo/ui/hooks/use-mobile";
import { createFileRoute } from "@tanstack/react-router";
import { LocateIcon, ScanIcon, UserIcon, LucideIcon, Bell } from "lucide-react";

export const Route = createFileRoute("/dashboard/settings")({
  component: RouteComponent,
});

export type SettingsRoute = {
  title: string;
  href: string;
  icon: LucideIcon;
};

function RouteComponent() {
  const isMobile = useIsMobile();
  return (
    <>
      <div className="hidden sm:block">
        <h1 className="sm:text-4xl text-2xl font-bold font-brand">Settings</h1>
        <span className="text-muted-foreground font-brand">
          Manage your account settings
        </span>
      </div>
      {isMobile ? (
        <SettingsMobileLayout routes={SettingsRoutes} />
      ) : (
        <SettingsDesktopLayout routes={SettingsRoutes} />
      )}
    </>
  );
}
