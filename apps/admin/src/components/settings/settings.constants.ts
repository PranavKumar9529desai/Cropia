import { LocateIcon, ScanIcon, UserIcon, LucideIcon, Bell } from "lucide-react";

export type SettingsRoute = {
  title: string;
  href: string;
  icon: LucideIcon;
};

export const settingsRoutes: SettingsRoute[] = [
  {
    title: "Account",
    href: "/settings/account",
    icon: UserIcon,
  },
  {
    title: "My Location",
    href: "/settings/location",
    icon: LocateIcon,
  },
  {
    title: "Notifications",
    href: "/settings/notification",
    icon: Bell,
  },
  {
    title: "My Scan",
    href: "/settings/scan",
    icon: ScanIcon,
  },
];
