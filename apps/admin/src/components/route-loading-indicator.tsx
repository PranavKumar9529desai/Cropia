import { useRouterState } from "@tanstack/react-router";

/**
 * A global route loading indicator that shows a thin animated bar at the top
 * of the screen when any route loader or beforeLoad is running.
 */
export function RouteLoadingIndicator() {
  const isLoading = useRouterState({ select: (s) => s.isLoading });

  if (!isLoading) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[9999] h-1 bg-primary/20 overflow-hidden">
      <div className="h-full w-1/3 bg-primary animate-loading-bar rounded-full" />
    </div>
  );
}
