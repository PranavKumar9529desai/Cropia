import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/dashboard/farmer-alerts")({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Hello "/dashboard/farmer-alerts"!</div>;
}
