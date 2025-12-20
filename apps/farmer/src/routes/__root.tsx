import { createRootRouteWithContext, Outlet } from "@tanstack/react-router";
// import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { authClient } from "../lib/auth/auth-client";

export interface MyRouterContext {
  auth: typeof authClient.$Infer.Session | null;
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
  component: () => (
    <>
      <div className="overflow-hidden w-screen h-screen">
        <Outlet />
      </div>
      {/* This adds the floating dev tools in the corner */}
      {/* <TanStackRouterDevtools />s */}
    </>
  ),
});
