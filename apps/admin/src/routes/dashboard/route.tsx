import { createFileRoute, Outlet, redirect, useChildMatches } from "@tanstack/react-router";
import BottomNav from "@/components/dashboard/bottom-navigation";
import { AppSidebar } from "@/components/dashboard/app-sidebar";
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@repo/ui/components/sidebar";
import { MobileTopbar } from "@/components/dashboard/mobile-topbar";
import { getJurisdictionDisplay } from "@/lib/get-jurisdiction";

export const Route = createFileRoute("/dashboard")({
  beforeLoad: async ({ context }) => {
    const isLogged = context.auth;
    if (!isLogged) {
      throw redirect({
        to: "/sign-in",
      });
    }
  },
  loader: async ({ context }) => {
    const data = context.auth;
    const username = data?.user?.name;
    const email = data?.user?.email;
    const image = data?.user?.image;
    const jurisdiction = data?.session?.jurisdiction;
    return { username, email, image, jurisdiction };
  },
  component: RouteComponent,
});

function RouteComponent() {
  const { username, email, image, jurisdiction } = Route.useLoaderData();
  /*
    The route title logic is derived from identifying the active child match.
    We look at the last part of the pathname for the current active match.
  */
  const matches = useChildMatches();
  const fullRoute = matches[0]?.pathname;
  const route = matches[0]?.pathname.split("/").pop();
  const isSettingRoute = matches.some((match) =>
    match.routeId.startsWith("/dashboard/settings"),
  );
  const jurisdictionDisplay = getJurisdictionDisplay(jurisdiction);


  return (
    <SidebarProvider>
      {/* Sidebar - visible on md and larger screens */}
      <div className="hidden sm:flex gap-4">
        <AppSidebar
          userInfo={{ name: username || "", email: email || "", avatar: image }}
          jurisdiction={jurisdictionDisplay}
        />
        <div className="flex items-center h-10 relative ">
          <div className="h-fit m-2 ">
            <SidebarTrigger />
          </div>
          {route !== "settings" && (

            <span className="absolute left-12 z-50 text-lg font-semibold font-brand capitalize text-nowrap">
              {fullRoute?.includes("organization") ? "My organization" : route}
            </span>
          )}
        </div>

      </div>

      {/* Main content area */}
      <SidebarInset className="h-svh overflow-hidden md:h-auto md:overflow-visible">
        {/* Mobile Topbar - visible only on mobile */}
        {isSettingRoute ? null : (
          <div className="md:hidden py-1">
            <MobileTopbar isAdmin={true} jurisdiction={jurisdictionDisplay} />
          </div>
        )}
        {/* <DashboardHeader /> */}
        <div className="flex flex-1 flex-col p-4 md:p-6 overflow-y-auto md:overflow-visible pb-24 md:pb-6 no-scrollbar">
          <Outlet />
        </div>
      </SidebarInset>

      {/* Bottom Navigation - visible only on mobile (md:hidden) */}
      <div className="md:hidden">
        <BottomNav />
      </div>
    </SidebarProvider>
  );
}
