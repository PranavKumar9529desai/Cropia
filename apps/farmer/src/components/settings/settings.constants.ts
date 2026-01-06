import { LocateIcon, ScanIcon, UserIcon, LucideIcon, Bell } from "lucide-react";

export type SettingsRouteType = {
  title: string;
  href: string;
  icon: LucideIcon;
};

export const SettingsRoutes: SettingsRouteType[] = [
  {
    title: "Account",
    href: "/dashboard/settings/account",
    icon: UserIcon,
  },
  {
    title: "My Location",
    href: "/dashboard/settings/location",
    icon: LocateIcon,
  },
  {
    title: "Notifications",
    href: "/dashboard/settings/notification",
    icon: Bell,
  },
  {
    title: "My Scan",
    href: "/settings/scan",
    icon: ScanIcon,
  },
];
