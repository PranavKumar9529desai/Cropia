import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/dashboard/area-scan")({
  component: RouteComponent,
});
// Build this Area Scan feature
function RouteComponent() {
  return <div>Hello "/dashboard/area-scan"!</div>;
}
