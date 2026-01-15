"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@repo/ui/components/dropdown-menu";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@repo/ui/components/avatar";
import { Bell, ChevronsUpDown, LogOut, Settings } from "lucide-react";
import { SidebarMenuButton, useSidebar } from "@repo/ui/components/sidebar";
import { Link } from "@tanstack/react-router";
import { ModeToggle } from "../theme-toggle";

interface UserInfo {
  name: string;
  email: string;
  avatar: string | null | undefined;
}

interface ProfileComponentProps {
  userInfo: UserInfo;
  handleLogout: () => void;
}

export const ProfileComponent = ({
  userInfo,
  handleLogout,
}: ProfileComponentProps) => {
  const { isMobile } = useSidebar();

  const user = {
    name: userInfo?.name || "User",
    email: userInfo?.email || "",
    avatar: userInfo?.avatar || "",
  };

  const initials = user.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <SidebarMenuButton
          size="lg"
          className="w-full data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground hover:bg-sidebar-accent/50 transition-all duration-300 rounded-xl"
        >
          <div className="relative flex-shrink-0">
            <Avatar className="h-9 w-9 rounded-full border-2 border-primary/10 transition-transform duration-300 group-hover:scale-105">
              <AvatarImage src={user.avatar} alt={user.name} />
              <AvatarFallback className="bg-primary/5 text-primary text-xs font-bold ring-1 ring-primary/20">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-sidebar bg-emerald-500 shadow-sm" />
          </div>
          <div className="grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden overflow-hidden ml-1">
            <span className="truncate font-bold tracking-tight text-foreground">
              {user.name}
            </span>
            <span className="truncate text-[11px] text-muted-foreground/80 font-medium">
              {user.email}
            </span>
          </div>
          <ChevronsUpDown className="ml-auto size-3.5 text-muted-foreground/40 group-data-[collapsible=icon]:hidden transition-opacity duration-300 group-hover:opacity-100" />
        </SidebarMenuButton>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-[--radix-dropdown-menu-trigger-width] min-w-[240px] rounded-xl p-2 shadow-xl border-border/50 backdrop-blur-sm"
        side={isMobile ? "bottom" : "right"}
        align="end"
        sideOffset={8}
      >
        <DropdownMenuLabel className="p-0 font-normal">
          <div className="flex items-center gap-3 px-3 py-2.5 text-left text-sm border-b border-border/40 mb-1">
            <div className="relative">
              <Avatar className="h-10 w-10 rounded-full border border-primary/10">
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback className="bg-primary/5 text-primary font-bold">
                  {initials}
                </AvatarFallback>
              </Avatar>
            </div>
            <div className="grid flex-1 text-left text-sm leading-tight overflow-hidden">
              <span className="truncate font-bold text-foreground">
                {user.name}
              </span>
              <span className="truncate text-xs text-muted-foreground font-medium">
                {user.email}
              </span>
            </div>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuGroup className="space-y-1">
          <Link to="/dashboard/settings/account">
            <DropdownMenuItem className="rounded-lg py-2.5 cursor-pointer focus:bg-accent/60 transition-colors">
              <Settings className="mr-3 h-4 w-4 text-primary/70" />
              <span className="font-medium text-sm">Account Settings</span>
            </DropdownMenuItem>
          </Link>
          <Link to="/dashboard/settings/notification">
            <DropdownMenuItem className="rounded-lg py-2.5 cursor-pointer focus:bg-accent/60 transition-colors">
              <Bell className="mr-3 h-4 w-4 text-primary/70" />
              <span className="font-medium text-sm">Notifications</span>
            </DropdownMenuItem>
          </Link>
        </DropdownMenuGroup>

        <DropdownMenuSeparator className="my-2 bg-border/40" />

        <div className="px-2 py-1.5 flex items-center justify-between text-xs font-medium text-muted-foreground uppercase tracking-wider">
          Appearance
        </div>
        <div className="mb-2">
          <ModeToggle reverse={true} />
        </div>

        <DropdownMenuSeparator className="my-2 bg-border/40" />

        <DropdownMenuItem
          onClick={handleLogout}
          className="rounded-lg py-2.5 cursor-pointer focus:bg-destructive focus:text-destructive-foreground text-destructive/90 transition-all font-medium"
        >
          <LogOut className="mr-3 h-4 w-4" />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
