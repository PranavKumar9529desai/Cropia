import { createRootRouteWithContext, Outlet } from "@tanstack/react-router";
// import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { authClient } from "@/lib/auth/auth-client";
import { RouteLoadingIndicator } from "@/components/route-loading-indicator";

export interface MyRouterContext {
  auth: typeof authClient.$Infer.Session | null;
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
  beforeLoad: async () => {
    const { data } = await authClient.getSession();
    return { auth: data };
  },
  component: () => (
    <>
      <RouteLoadingIndicator />
      <div className="overflow-hidden w-screen h-screen">
        <Outlet />
      </div>
      {/* This adds the floating dev tools in the corner */}
      {/* <TanStackRouterDevtools />s */}
    </>
  ),
});

