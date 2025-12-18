import { createRootRouteWithContext, Outlet } from "@tanstack/react-router";
import { authClient } from "../lib/auth/auth-client";

export interface MyRouterContext {
  // This allows child routes to use context.auth in their beforeLoad guards
  auth: typeof authClient.$Infer.Session | null;
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
  /**
   * 1. ROUTE GUARD LOGIC (Static Check)
   * We use getSession() here because hooks (useSession) aren't allowed.
   */
  beforeLoad: async () => {
    const { data: session } = await authClient.getSession();
    return { auth: session };
  },
  component: RootComponent,
});

function RootComponent() {
  /**
   * 2. UI LOGIC (Dynamic/Reactive)
   * Better Auth recommends this for the UI. It will sync 
   * automatically if the session changes (e.g. Org switch).
   */
  const { data: session, isPending } = authClient.useSession();

  if (isPending) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p>Loading Cropia...</p>
      </div>
    );
  }

  return (
    <>
      <div className="overflow-hidden w-screen h-screen">
        {/* We pass the session through the Outlet context if needed */}
        <Outlet />
      </div>
    </>
  );
}