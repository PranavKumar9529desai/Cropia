import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { authClient } from "../../lib/auth/auth-client";
import { SignUpForm, type SignUpFormValues } from "@repo/ui/components/auth";
import { toast } from "@repo/ui/components/sonner";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@repo/ui/components/card";

export const Route = createFileRoute("/_auth/accept-invitation/$id")({
  loader: async ({ params }) => {
    if (!params.id) {
      throw new Error("Missing invitation ID");
    }

    // Fetch from our custom public endpoint
    const backendUrl =
      import.meta.env.VITE_BACKEND_URL || "http://localhost:4000";
    const res = await fetch(`${backendUrl}/api/invitation/${params.id}`);

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      // If the invite is invalid, we really should stop the user here.
      throw new Error(err.error || "Invalid or expired invitation");
    }

    const data = await res.json();

    return {
      invitation: {
        id: params.id,
        email: data.email,
        organization: {
          name: data.organizationName,
        },
      },
    };
  },
  errorComponent: ({ error }) => {
    return (
      <div className="flex h-screen items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-red-500">Invalid Invitation</CardTitle>
            <CardDescription>{error.message}</CardDescription>
          </CardHeader>
          <CardContent>
            <Link to="/sign-in" className="text-primary hover:underline">
              Go to Sign In
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  },
  pendingComponent: () => (
    <div className="flex h-screen items-center justify-center">
      <p>Validating invitation...</p>
    </div>
  ),
  component: AcceptInvitePage,
});

function AcceptInvitePage() {
  const { invitation } = Route.useLoaderData();
  const { id } = Route.useParams();
  const navigate = useNavigate();

  const handleSignUp = async (values: SignUpFormValues) => {
    const toastId = toast.loading(
      "Creating Account and Joining Organization...",
    );
    try {
      const { error: signUpError } = await authClient.signUp.email({
        email: values.email,
        name: values.username,
        password: values.password,
      });

      if (signUpError) {
        toast.error(signUpError.message || "Failed to create account", {
          id: toastId,
        });
        return;
      }

      const { error: acceptError } =
        await authClient.organization.acceptInvitation({
          invitationId: id,
        });

      if (acceptError) {
        console.error("Accept invite error:", acceptError);
        toast.success(
          "Account created! Please verify your email to continue.",
          { id: toastId },
        );
        navigate({
          to: "/check-email",
          search: { email: values.email },
        });
        return;
      }

      toast.success("Welcome! You have joined the organization.", {
        id: toastId,
      });
      navigate({
        to: "/check-email",
        search: { email: values.email },
      });
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong", { id: toastId });
    }
  };

  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-4">
      <div className="mb-4 text-center">
        <h1 className="text-2xl font-bold">You've been invited!</h1>
        <p className="text-muted-foreground">
          Join <strong>{invitation.organization.name}</strong> on Cropia.
        </p>
      </div>

      <SignUpForm
        onSubmit={handleSignUp}
        defaultValues={{
          email: invitation.email,
        }}
        emailReadOnly={true}
        signInLink={
          <Link to="/sign-in" className="ml-1 text-primary hover:underline">
            Sign In
          </Link>
        }
      />
    </div>
  );
}
