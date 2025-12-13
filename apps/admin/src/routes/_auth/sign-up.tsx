import { createFileRoute } from "@tanstack/react-router";
import { SignUp } from "../../components/auth-components/sign-up";

export const Route = createFileRoute("/_auth/sign-up")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="w-full h-full flex items-center justify-center">
      <SignUp />
    </div>
  );
}
