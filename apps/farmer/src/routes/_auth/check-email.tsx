import { createFileRoute } from "@tanstack/react-router";
import { toast } from "@repo/ui/components/sonner";
import { CheckEmailCard } from "@repo/ui/components/auth/check-email-card";
import { authClient } from "../../lib/auth/auth-client";

// Validate that an email is passed in the URL
export interface CheckEmailSearch {
  email: string;
}

export const Route = createFileRoute("/_auth/check-email")({
  validateSearch: (search: Record<string, unknown>): CheckEmailSearch => ({
    email: (search.email as string) || "",
  }),
  component: CheckEmailPage,
});

function CheckEmailPage() {
  const { email } = Route.useSearch();

  const handleResend = async () => {
    try {
      const { error } = await authClient.sendVerificationEmail({
        email,
        callbackURL: "/verify-email", // Where to go AFTER they click the link in email
      });

      if (error) {
        toast.error(error.message || "Failed to resend email");
        return;
      }
      toast.success("Verification email sent!");
    } catch {
      toast.error("Something went wrong");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <CheckEmailCard email={email} onResend={handleResend} />
    </div>
  );
}
