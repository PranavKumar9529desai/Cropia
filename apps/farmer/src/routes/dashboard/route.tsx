import {
  createFileRoute,
  Outlet,
  redirect,
  useChildMatches,
} from "@tanstack/react-router";
import BottomNav from "../../components/dashboard/bottom-navigation";
import { AppSidebar } from "../../components/dashboard/app-sidebar";
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@repo/ui/components/sidebar";
import { MobileTopbar } from "../../components/dashboard/mobile-topbar";
import { useFCM } from "@/hooks/use-fcm";
import { getuserLocationStatus } from "../../utils/user-location";

export const Route = createFileRoute("/dashboard")({
  beforeLoad: async ({ context }) => {
    const isLogged = context.auth;
    if (!isLogged) {
      throw redirect({
        to: "/sign-in",
      });
    }
    const isLocationFormSubmitted = await getuserLocationStatus();

    if (!isLocationFormSubmitted) {
      throw redirect({
        to: "/$authType/location",
        params: { authType: "sign-in" },
      });
    }
  },
  loader: async ({ context }) => {
    const data = context.auth;
    const username = data?.user?.name;
    const email = data?.user?.email;
    const image = data?.user?.image;
    return { username, email, image };
  },
  component: RouteComponent,
});

function RouteComponent() {
  useFCM();
  const { username, email, image } = Route.useLoaderData();
  const matches = useChildMatches();
  const isSettingRoute = matches.some((match) =>
    match.routeId.startsWith("/dashboard/settings"),
  );
  /*
    The route title logic is derived from identifying the active child match.
    We look at the last part of the pathname for the current active match.
  */
  const route = matches[0]?.pathname.split("/").pop();
  console.log("theroute is this", route);
  console.log(username, email, image);
  return (
    <SidebarProvider>
      <AppSidebar
        userInfo={{ name: username || "", email: email || "", avatar: image }}
      />

      <SidebarInset className="flex flex-col h-svh overflow-hidden">
        {/* Mobile Topbar - visible only on mobile */}
        {!isSettingRoute && (
          <div className="md:hidden py-1">
            <MobileTopbar />
          </div>
        )}

        <header className="hidden md:flex h-14 shrink-0 items-center justify-between px-4 border-b sticky top-0 bg-background/80 backdrop-blur-sm z-10">
          <div className="flex items-center gap-4">
            <SidebarTrigger />
            {route !== "settings" && (
              <>
                <div className="h-4 w-px bg-border mx-1" />
                <span className="text-lg font-semibold font-brand capitalize">
                  {route}
                </span>
              </>
            )}
          </div>
        </header>

        <div className="flex flex-1 flex-col p-4 md:p-6 overflow-y-auto pb-24 md:pb-6 no-scrollbar">
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
