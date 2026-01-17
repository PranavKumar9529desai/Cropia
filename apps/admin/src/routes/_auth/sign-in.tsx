import { createFileRoute } from "@tanstack/react-router";
import { SignIn } from "../../components/auth-components/sign-in";

import { z } from "zod";

const signInSearchSchema = z.object({
  email: z.string().optional(),
  password: z.string().optional(),
});

export const Route = createFileRoute("/_auth/sign-in")({
  validateSearch: (search) => signInSearchSchema.parse(search),
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="flex justify-center items-center w-full h-full">
      <SignIn />
    </div>
  );
}
