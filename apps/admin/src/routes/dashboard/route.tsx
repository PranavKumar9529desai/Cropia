import {
  createFileRoute,
  Outlet,
  redirect,
  useChildMatches,
} from "@tanstack/react-router";
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
  const lastMatch = matches[matches.length - 1];
  const fullRoute = matches[0]?.pathname || "";
  const lastSegment =
    lastMatch?.pathname.split("/").filter(Boolean).pop() || "dashboard";

  const isSettingRoute = matches.some((match) =>
    match.routeId.startsWith("/dashboard/settings"),
  );
  const jurisdictionDisplay = getJurisdictionDisplay(jurisdiction);

  const displayTitle = fullRoute.includes("organization")
    ? "My organization"
    : lastSegment;

  return (
    <SidebarProvider>
      <AppSidebar
        userInfo={{ name: username || "", email: email || "", avatar: image }}
        jurisdiction={jurisdictionDisplay}
      />

      <SidebarInset className="flex flex-col h-svh overflow-hidden">
        {/* Mobile Topbar - visible only on mobile */}
        {!isSettingRoute && (
          <div className="md:hidden py-1">
            <MobileTopbar isAdmin={true} jurisdiction={jurisdictionDisplay} />
          </div>
        )}

        {/* Desktop Header - sticky top */}
        <header className="hidden md:flex h-14 shrink-0 items-center justify-between px-4 border-b sticky top-0 bg-background/80 backdrop-blur-sm z-10">
          <div className="flex items-center gap-4">
            <SidebarTrigger />
            <div className="h-4 w-px bg-border mx-1" />
            <span className="text-lg font-semibold font-brand capitalize">
              {displayTitle === "dashboard" ? "Overview" : displayTitle}
            </span>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-2 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          <Outlet />
        </main>
      </SidebarInset>

      {/* Bottom Navigation - visible only on mobile */}
      <div className="md:hidden">
        <BottomNav />
      </div>
    </SidebarProvider>
  );
}
