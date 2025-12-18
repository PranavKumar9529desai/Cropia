import { authClient } from "@/lib/auth/auth-client";
import { Button } from "@repo/ui/components/button";
import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  beforeLoad: async () => {
    const { data } = await authClient.getSession();
    const isLoggedIn = data?.user ? true : false;
    if (!isLoggedIn) {
      redirect({ to: "/sign-in" });
    }
  },
  component: IndexComponent,
});

function IndexComponent() {
  return (
    <>
      <Button
        className="max-w-xs w-full text-center"
        title="signOut"
        onClick={() => {
          authClient.signOut();
        }}
      >
        Sign Out
      </Button>
    </>
  );
}
