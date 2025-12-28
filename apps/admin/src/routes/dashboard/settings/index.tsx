import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/dashboard/settings/")({
  beforeLoad: () => {
    // Check if we are running in the browser
    if (typeof window !== "undefined") {
      const MOBILE_BREAKPOINT = 768;
      const isMobile = window.innerWidth < MOBILE_BREAKPOINT;

      if (!isMobile) {
        throw redirect({
          to: "/dashboard/settings/account",
        });
      }
    }
  },
  component: RouteComponent,
});

function RouteComponent() {
  return <></>;
}
