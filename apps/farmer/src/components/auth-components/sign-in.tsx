import { Link, useNavigate, useRouter } from "@tanstack/react-router";
import { toast } from "@repo/ui/components/sonner";
import { SignInForm, type SignInFormValues } from "@repo/ui/components/auth";
import { authClient } from "@/lib/auth/auth-client";
import { GoogleButton } from "./google-button";

export const SignIn = () => {
  const router = useRouter();
  const navigate = useNavigate();

  const handleSubmit = async (values: SignInFormValues) => {
    const toastId = toast.loading("signing in..!");
    try {
      const { error } = await authClient.signIn.email({
        email: values.email,
        password: values.password,
      });

      if (error) {
        toast.error(error.message || "Something Went Wrong", {
          id: toastId,
        });
        return;
      }

      toast.success("Successfully Signed In..!", {
        id: toastId,
      });

      await router.invalidate();

      // Check if user has location data
      const session = await authClient.getSession();
      if (session?.data?.user) {
        // Note: We'll need to fetch location data from the API
        // For now, we'll redirect to location page and let it handle the check
        navigate({
          to: "/$authType/location",
          params: { authType: "sign-in" },
        });
      }
    } catch {
      toast.error("Network Error!", { id: toastId });
      return;
    }
  };

  return (
    <SignInForm
      onSubmit={handleSubmit}
      signUpLink={
        <Link
          to="/sign-up"
          className="text-primary/90 hover:text-primary/20 ml-1 underline"
        >
          Sign Up
        </Link>
      }
      forgotPasswordLink={
        <Link
          to="/forgot-password"
          className="underline font-light text-sm  hover:text-primary hover:underline decoration-primary p-2 duration-200 transition-colors"
        >
          Forgot Password ?
        </Link>
      }
      googleButton={<GoogleButton title="Continue With Google" />}
    />
  );
};
