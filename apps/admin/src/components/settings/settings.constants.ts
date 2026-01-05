import { ScanIcon, UserIcon, LucideIcon, Bell } from "lucide-react";

export type SettingsRouteType = {
  title: string;
  href: string;
  icon: LucideIcon;
};

export const SettingsRoutes: SettingsRouteType[] = [
  // TODO : Add organization route
  {
    title: "Account",
    href: "/dashboard/settings/account",
    icon: UserIcon,
  },
  {
    title: "Notifications",
    href: "/dashboard/settings/notification",
    icon: Bell,
  },
  {
    title: "User's Scan",
    href: "/dashboard/settings/scan",
    icon: ScanIcon,
  },
];
