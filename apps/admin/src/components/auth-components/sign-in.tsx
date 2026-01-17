import { Link, useNavigate, useRouter } from "@tanstack/react-router";
import { toast } from "@repo/ui/components/sonner";
import { SignInForm, type SignInFormValues } from "@repo/ui/components/auth";
import { authClient } from "../../lib/auth/auth-client";
import { Route } from "../../routes/_auth/sign-in";

export const SignIn = () => {
  const router = useRouter();
  const navigate = useNavigate();
  const { email, password } = Route.useSearch();

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

      const session = await authClient.getSession();
      if (session?.data?.user) {
        navigate({
          to: "/dashboard",
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
      defaultValues={{
        email,
        password,
      }}
      readOnlyEmail={!!email}
      readOnlyPassword={!!password}
      isGuest={!!(email && password)}
      signUpLink={
        <Link
          to="/sign-up"
          className="text-primary/90 hover:text-primary/20 ml-1"
        >
          Sign Up
        </Link>
      }
      forgotPasswordLink={
        <Link
          to="/forgot-password"
          className="font-light text-sm  hover:text-primary hover:underline decoration-primary p-2 duration-200 transition-colors"
        >
          Forgot Password ?
        </Link>
      }
    // currently disabled for admin
    // TOOD: add flow where admin can signup usng goole accrount with same email as invitation email
    // googleButton={<GoogleButton title="Continue With Google" />}
    />
  );
};
