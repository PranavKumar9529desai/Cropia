import { Link, useMatches } from "@tanstack/react-router";
import { BottomNavigation } from "@repo/ui/components/bottom-navigation";
import type { BottomNavItem } from "@repo/ui/components/bottom-navigation";
import { Map, BellRing, Scan, Building2 } from "lucide-react";

export default function BottomNav() {
  const matches = useMatches();
  const pathname = matches[matches.length - 1]?.pathname;

  const navItems: BottomNavItem[] = [
    {
      label: "Area Scan",
      icon: Scan,
      path: "/dashboard/area-scan",
    },
    {
      label: "Crop Map",
      icon: Map,
      path: "/dashboard/crop-map",
    },
    {
      label: "Farmer Alerts",

      icon: BellRing,
      path: "/dashboard/farmer-alerts",
    },
    {
      label: "Organization",
      icon: Building2,
      path: "/dashboard/organization/my-organization",
    },
  ];

  return (
    <BottomNavigation
      items={navItems}
      currentPath={pathname}
      renderLink={(item, children, className) => (
        <Link
          to={item.path}
          className={className}
          // Optional: Force TanStack active props to be empty so our component handles styling
          activeProps={{ className: "" }}
        >
          {children}
        </Link>
      )}
    />
  );
}
