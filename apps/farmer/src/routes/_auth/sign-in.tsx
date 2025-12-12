import { createFileRoute } from "@tanstack/react-router";
import { SignIn } from "../../components/auth-components/sign-in";

export const Route = createFileRoute("/_auth/sign-in")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="flex justify-center items-center w-full h-full">
      <SignIn />
    </div>
  );
}
