import { Link, useNavigate } from "@tanstack/react-router";
import { toast } from "@repo/ui/components/sonner";
import { SignUpForm, type SignUpFormValues } from "@repo/ui/components/auth";
import { authClient } from "../../lib/auth/auth-client";
import { GoogleButton } from "./google-button";

export const SignUp = () => {
  const navigate = useNavigate();

  const handleSubmit = async (values: SignUpFormValues) => {
    const toastId = toast.loading("Creating Account...");
    try {
      const { error } = await authClient.signUp.email({
        email: values.email,
        name: values.username,
        password: values.password,
      });

      if (error) {
        toast.error(error.message || "Something Went Wrong", {
          id: toastId,
        });
        return;
      }

      toast.success("Account Created Successfully..!", { id: toastId });

      // Redirect to location page after successful sign-up
      // Redirect to location page after successful sign-up
      navigate({
        to: "/check-email",
        search: { email: values.email },
      });
    } catch {
      toast.error("Connection Failed..!", { id: toastId });
    }
  };

  return (
    <SignUpForm
      onSubmit={handleSubmit}
      signInLink={
        <Link to="/sign-in" className="ml-1">
          Sign In
        </Link>
      }
      googleButton={<GoogleButton title="Continue With Google" />}
    />
  );
};
