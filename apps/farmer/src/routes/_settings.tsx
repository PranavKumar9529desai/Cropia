import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_settings")({
  beforeLoad: async ({ context }) => {
    if (!context.auth) {
      throw redirect({
        to: "/sign-in",
      });
    }
  },
  component: () => (
    <div className="flex flex-col min-h-screen bg-background">
      <Outlet />
    </div>
  ),
});
