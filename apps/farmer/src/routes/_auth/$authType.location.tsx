import * as React from "react";
import { Button } from "@repo/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/card";
import { Form } from "@repo/ui/components/form";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { toast } from "@repo/ui/components/sonner";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  createLocationSchema,
  CreateLocationInputType,
  postuserlocation,
  forwardGeocode,
} from "../../utils/user-location";
import { authClient } from "../../lib/auth/auth-client";
import { Step1AdminDetails } from "../../components/location/step-1-location-details";
import { Step2MapDetails } from "../../components/location/step-2-map-details";

// 1. Route Param Validation
const paramsType = z.enum(["sign-in", "sign-up"]);

export const Route = createFileRoute("/_auth/$authType/location")({
  loader: async ({ params }) => {
    const result = paramsType.safeParse(params.authType);
    const isLoggedIn = await authClient.getSession();
    if (!result.success || !isLoggedIn.data) {
      throw redirect({
        to: "/sign-in",
      });
    }
  },
  component: RouteComponent,
});

export function RouteComponent() {
  const { authType } = Route.useParams();
  const { auth } = Route.useRouteContext();
  const [step, setStep] = React.useState(1);

  // 2. Location Schema
  const form = useForm<CreateLocationInputType>({
    resolver: zodResolver(createLocationSchema),
    defaultValues: {
      country: "India",
      latitude: 0,
      longitude: 0,
      address: "",
      village: "",
      district: "",
      state: "",
      taluka: "",
      pincode: "",
    },
  });

  const handleNext = async () => {
    // Validate fields for Step 1
    const fieldsToValidate: (keyof CreateLocationInputType)[] = [
      "state",
      "district",
      "taluka",
      "village",
    ];
    const isValid = await form.trigger(fieldsToValidate);

    if (isValid) {
      const state = form.getValues("state");
      const district = form.getValues("district");
      const taluka = form.getValues("taluka");
      const village = form.getValues("village");

      const query = `${village ? village + ", " : ""}${taluka ? taluka + ", " : ""}${district}, ${state}, India`;
      const toastId = toast.loading("Locating selection on map...");
      const coords = await forwardGeocode(query);

      if (coords) {
        form.setValue("latitude", coords.lat);
        form.setValue("longitude", coords.lng);
        toast.success("Area located on map", { id: toastId });
      } else {
        toast.info("Could not find exact village, please pick on map", {
          id: toastId,
        });
      }

      setStep(2);
      window.scrollTo(0, 0);
    } else {
      toast.error("Please fill all required fields in Step 1");
    }
  };

  const handleBack = () => {
    setStep(1);
    window.scrollTo(0, 0);
  };

  const onSubmit = async (values: CreateLocationInputType) => {
    console.log("form is submitted with values", values);
    // Validate that taluka is present being sent
    if (!values.taluka) {
      console.error("CRITICAL: Taluka is missing locally before submission!");
    } else {
      console.log("Taluka being sent:", values.taluka);
    }
    const toastId = toast.loading("Saving Location Details...");

    try {
      if (!auth?.user?.id) {
        toast.error("User not authenticated", { id: toastId });
        return;
      }

      const response = await postuserlocation(values);
      if (!response.ok) {
        let errorMessage = "Failed to save location";
        try {
          const errorData = await response.json();
          if (typeof (errorData as any).error === "string") {
            errorMessage = (errorData as any).error;
          } else if ((errorData as any).error?.message) {
            errorMessage = (errorData as any).error.message;
          } else if ((errorData as any).message) {
            errorMessage = (errorData as any).message;
          } else {
            errorMessage = JSON.stringify((errorData as any).error);
          }
        } catch (e) { }

        toast.error(errorMessage, { id: toastId });
        return;
      }

      const data = await response.json();
      if (data.success) {
        toast.success("Location saved successfully!", { id: toastId });
        window.location.href = "/dashboard";
      }
    } catch (error) {
      console.error("Error submitting location:", error);
      toast.error("An error occurred while saving location", { id: toastId });
    }
  };

  return (
    <>
      <Card className="w-full max-w-md sm:max-w-lg border-none shadow-none bg-transparent px-4 sm:px-2">
        <CardHeader className="text-3xl font-bold text-primary space-y-2 p-4">
          <CardTitle className="">
            {authType === "sign-up" ? "Final Step" : "Location Required"}
          </CardTitle>
          <CardDescription>
            {step === 1
              ? "Select your administrative area."
              : "Pin your exact farm location on the map."}
          </CardDescription>
        </CardHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col gap-4"
          >
            <CardContent className="space-y-4 text-primary/90 p-2 max-h-[60vh] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">
              {step === 1 ? (
                <Step1AdminDetails form={form} />
              ) : (
                <Step2MapDetails form={form} />
              )}
            </CardContent>

            <CardFooter className="w-full flex gap-3 px-3 pt-2">
              {step === 1 ? (
                <Button type="button" onClick={handleNext} className="w-full">
                  Next Step
                </Button>
              ) : (
                <>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleBack}
                    className="w-1/3"
                  >
                    Back
                  </Button>
                  <Button type="submit" className="w-2/3">
                    Complete Setup
                  </Button>
                </>
              )}
            </CardFooter>
          </form>
        </Form>
      </Card>
    </>
  );
}