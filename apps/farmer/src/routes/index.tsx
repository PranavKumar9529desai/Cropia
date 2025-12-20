import { authClient } from "@/lib/auth/auth-client";
import { Button } from "@repo/ui/components/button";
import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: IndexComponent,
});

function IndexComponent() {
  const session = authClient.useSession();
  return (
    <div className="flex flex-col items-center justify-center h-screen gap-4">
      {session.data ? (
        <>
          <Link to="/dashboard">
            <Button className="max-w-xs w-full text-center">
              Go to Dashboard
            </Button>
          </Link>
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
      ) : (
        <Link to="/sign-in">
          <Button className="max-w-xs w-full text-center">Sign In</Button>
        </Link>
      )}
    </div>
  );
}
