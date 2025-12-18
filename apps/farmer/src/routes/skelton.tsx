import { Skeleton } from "@repo/ui/components/skeleton";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/skelton")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="flex justify-start">
      <div className="rounded-lg px-3 py-2 max-w-[85%] space-y-2">
        <Skeleton className="h-4 w-[200px] bg-muted" />
        <Skeleton className="h-4 w-[150px] bg-muted" />
      </div>
    </div>
  );
}
