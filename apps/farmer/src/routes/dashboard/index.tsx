import { Button } from "@repo/ui/components/button";
import { createFileRoute } from "@tanstack/react-router";
import { authClient } from "../../lib/auth/auth-client";
import { toast } from "@repo/ui/components/sonner";
import { useRouter } from "@tanstack/react-router";

export const Route = createFileRoute("/dashboard/")({
  component: RouteComponent,
});

function RouteComponent() {
  const router = useRouter();
  const handleClick = async () => {
    const { error } = await authClient.signOut();
    if (error) {
      toast.error("Something Went Wrong");
      return;
    }

    router.invalidate();
    toast.success("Sucessfull logged out");
  };
  return (
    <div className="flex justify-center items-center h-full w-full text-3xl">
      <Button onClick={handleClick}>SignOut</Button>
    </div>
  );
}
