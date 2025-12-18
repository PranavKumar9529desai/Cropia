import { useNavigate } from "@tanstack/react-router";
import { toast } from "@repo/ui/components/sonner";
import { GoogleButton as GoogleButtonUI } from "@repo/ui/components/auth";
import { authClient } from "../../lib/auth/auth-client";
import { useState } from "react";

export const GoogleButton = ({ title }: { title: string }) => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    const toastId = toast.loading("Wait Signing You in..!");
    try {
      const redirect_url = import.meta.env.VITE_BASE_URL + "/dashboard";
      console.log("redriect_url", redirect_url);
      const { error } = await authClient.signIn.social({
        provider: "google",
        callbackURL:
          redirect_url ?? import.meta.env.VITE_BASE_URL + "/dashboard",
      });
      if (error) {
        toast.error("Failed to SignIn..!", { id: toastId });
        setIsLoading(false);
        return;
      }
      toast.success("Successfully Signed In..!", { id: toastId });

      // After Google sign-in, redirect to sign-in/location
      // The location page will check if user already has location data
      navigate({ to: "/$authType/location", params: { authType: "sign-in" } });
    } catch {
      toast.error("Something Went Wrong...!", { id: toastId });
      setIsLoading(false);
    }
  };

  return (
    <GoogleButtonUI
      title={title}
      onClick={handleGoogleSignIn}
      isLoading={isLoading}
      iconSrc="/google.png"
    />
  );
};
