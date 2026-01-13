import { Map, BellRing, Scan, Building2, Users, UserPlus, ChevronDown, type LucideIcon } from "lucide-react";
import { useState } from "react";
import { cn } from "@repo/ui/lib";
import { Link, useMatches, useRouter } from "@tanstack/react-router";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarSeparator,
} from "@repo/ui/components/sidebar";
import { authClient } from "@/lib/auth/auth-client";
import { toast } from "@repo/ui/components/sonner";
import { ProfileComponent } from "./profile";

interface NavItem {
  label: string;
  icon: LucideIcon;
  path: string;
}

const navItems: NavItem[] = [
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
];

const orgItems: NavItem[] = [
  {
    label: "My Organization",
    icon: Building2,
    path: "/dashboard/organization/my-organization",
  },
  {
    label: "Team Members",
    icon: Users,
    path: "/dashboard/organization/members",
  },
  {
    label: "Invite New Member",
    icon: UserPlus,
    path: "/dashboard/organization/organization-invite",
  },
];

interface AppSidebarProps {
  jurisdiction?: string;
  userInfo: {
    name: string;
    email: string;
    avatar: string | null | undefined;
  };
}

export function AppSidebar({ userInfo, jurisdiction }: AppSidebarProps) {
  const matches = useMatches();
  const router = useRouter();
  const [isOrgOpen, setIsOrgOpen] = useState(true);

  const handleLogout = async () => {
    // Add your logout logic here
    await authClient.signOut();
    toast.success("Logged out successfully");
    router.invalidate();
  };

  return (
    <Sidebar collapsible="icon" >
      <SidebarHeader className="">
        <div className="flex items-center gap-3 px-1 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0">
          <img
            src="/favicon/favicon.svg"
            alt="Cropia Logo"
            className="size-10 shrink-0"
          />
          <div className="flex flex-col truncate group-data-[collapsible=icon]:hidden font-brand">
            <span className="text-lg font-bold text-foreground">Cropia</span>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest">
                Admin
              </span>
              {jurisdiction && (
                <>
                  <span className="h-0.5 w-0.5 rounded-full bg-muted-foreground" />
                  <span className="text-[10px] font-medium text-primary">
                    {jurisdiction}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="pt-2">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = matches.some(
                  (match) => match.pathname === item.path,
                );

                return (
                  <SidebarMenuItem key={item.path}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      tooltip={item.label}
                      className={cn(
                        "duration-300 transition-colors hover:!bg-accent hover:!text-accent-foreground",
                        isActive
                          ? "bg-accent text-accent-foreground font-medium"
                          : "text-muted-foreground",
                      )}
                    >
                      <Link to={item.path}>
                        <Icon strokeWidth={isActive ? 3 : 2} />
                        <span>{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                onClick={() => setIsOrgOpen(!isOrgOpen)}
                className="hover:!bg-transparent group/org"
                tooltip="Organization"
              >
                <div className="flex w-full items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground/60">
                    Organization
                  </span>
                  <ChevronDown
                    className={cn(
                      "size-3 text-muted-foreground/60 transition-transform duration-200",
                      isOrgOpen ? "rotate-0" : "-rotate-90",
                    )}
                  />
                </div>
              </SidebarMenuButton>

              {isOrgOpen && (
                <SidebarMenuSub className="mt-1">
                  {orgItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = matches.some(
                      (match) => match.pathname === item.path,
                    );

                    return (
                      <SidebarMenuSubItem key={item.path}>
                        <SidebarMenuSubButton
                          asChild
                          isActive={isActive}
                          className={cn(
                            "duration-300 transition-colors hover:!bg-accent hover:!text-accent-foreground",
                            isActive
                              ? "bg-accent/50 text-accent-foreground font-medium"
                              : "text-muted-foreground/70",
                          )}
                        >
                          <Link to={item.path}>
                            <Icon className="size-4" strokeWidth={isActive ? 2.5 : 2} />
                            <span>{item.label}</span>
                          </Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    );
                  })}
                </SidebarMenuSub>
              )}
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarSeparator />
        <SidebarMenu>
          <SidebarMenuItem>
            <ProfileComponent handleLogout={handleLogout} userInfo={userInfo} />
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
