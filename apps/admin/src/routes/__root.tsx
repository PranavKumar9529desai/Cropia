import { createRootRouteWithContext, Outlet } from "@tanstack/react-router";
import { authClient } from "../lib/auth/auth-client";

export interface MyRouterContext {
  // This allows child routes to use context.auth in their beforeLoad guards
  auth: typeof authClient.$Infer.Session | null;
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
  component: RootComponent,
});

function RootComponent() {
  /**
   * 2. UI LOGIC (Dynamic/Reactive)
   * Better Auth recommends this for the UI. It will sync
   * automatically if the session changes (e.g. Org switch).
   */

  return (
    <>
      <div className="overflow-hidden w-screen h-screen">
        {/* We pass the session through the Outlet context if needed */}
        <Outlet />
      </div>
    </>
  );
}
