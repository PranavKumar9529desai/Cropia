import { Home, ScanLine, MessageSquare, } from "lucide-react";
import { cn } from "@repo/ui/lib";
import { Link, useLocation, useRouter } from "@tanstack/react-router";
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
  SidebarSeparator,
} from "@repo/ui/components/sidebar";
import { authClient } from "../../lib/auth/auth-client";
import { toast } from "@repo/ui/components/sonner";
import { ProfileComponent } from "./profile";
import { useNotifications } from "@/hooks/use-notifications";

interface NavItem {
  label: string;
  icon: typeof Home;
  path: string;
}

const navItems: NavItem[] = [
  {
    label: "Home",
    icon: Home,
    path: "/dashboard/home",
  },
  {
    label: "Scan",
    icon: ScanLine,
    path: "/dashboard/scan",
  },
  {
    label: "Assistant",
    icon: MessageSquare,
    path: "/dashboard/assistant",
  },
];

interface AppSidebarProps {
  userInfo: {
    name: string;
    email: string;
    avatar: string | null | undefined;
  };
}

export function AppSidebar({ userInfo }: AppSidebarProps) {
  const { pathname } = useLocation();
  const router = useRouter();
  const { unreadCount } = useNotifications();

  const handleLogout = async () => {
    // Add your logout logic here
    await authClient.signOut();
    toast.success("Logged out successfully");
    router.invalidate();
    console.log("Logout clicked");
  };

  return (
    <Sidebar collapsible="icon">
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
                const isActive = pathname === item.path;

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
      </SidebarContent>

      <SidebarFooter className="*ring-none">
        <SidebarSeparator className="bg-primary" />
        <SidebarMenuItem className="ring-none">
          <SidebarMenuButton asChild tooltip={"profile"}>
            <ProfileComponent handleLogout={handleLogout} userInfo={userInfo} />
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarFooter>
    </Sidebar>
  );
}
