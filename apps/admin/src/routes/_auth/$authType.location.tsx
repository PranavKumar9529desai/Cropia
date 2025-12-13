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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@repo/ui/components/form";
import { Input } from "@repo/ui/components/input";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { toast } from "@repo/ui/components/sonner";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { MapPin } from "lucide-react"; // Assuming you have lucide-react, standard with shadcn
import { postuserlocation } from "../../utils/user-location";
import { authClient } from "../../lib/auth/auth-client";

// 1. Route Param Validation
const paramsType = z.enum(["sign-in", "sign-up"]);

const createLocationSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  address: z.string().optional(),
  village: z.string().optional(),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  district: z.string().min(1, "District is required"),
  pincode: z.string().min(1, "Pincode is required"),
  country: z.string(),
});

type CreateLocationInputType = z.infer<typeof createLocationSchema>;

const loadingToast = toast.loading("Loading...");

export const Route = createFileRoute("/_auth/$authType/location")({
  loader: async ({ params }) => {
    const result = paramsType.safeParse(params.authType);
    const isLoggedIn = await authClient.getSession();
    if (!result.success || !isLoggedIn.data) {
      throw redirect({
        to: "/sign-in", // Ensure this path matches your router structure
      });
    }
  },
  component: RouteComponent,
});

export function RouteComponent() {
  // const router = useRouter()
  const { authType } = Route.useParams();
  const { auth } = Route.useRouteContext();

  // 2. Location Schema
  const form = useForm<CreateLocationInputType>({
    resolver: zodResolver(createLocationSchema),
    defaultValues: {
      country: "India",
      latitude: 0,
      longitude: 0,
      address: "",
      village: "",
      city: "",
      district: "",
      state: "",
      pincode: "",
    },
  });

  // 3. Geolocation Helper

  const handleDetectLocation = (e: React.MouseEvent) => {
    e.preventDefault();

    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser", {
        id: loadingToast,
      });
      return;
    }

    toast.info("Detecting location (High Accuracy)...", { id: loadingToast });

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const long = position.coords.longitude;

        // 1. Set Coordinates
        form.setValue("latitude", lat);
        form.setValue("longitude", long);

        // 2. Call Reverse Geocoding API
        const loadingToast = toast.loading("Fetching address details...");

        try {
          // Using OpenStreetMap Nominatim API (Free, no key required for low usage)
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${long}`,
          );

          if (!response.ok) throw new Error("Failed to fetch address");

          const data = await response.json();
          const addr = data.address;

          if (addr) {
            // Map API response to form fields
            // Nominatim returns variable fields (city, town, village, hamlet, etc.)
            const city =
              addr.city || addr.town || addr.municipality || addr.village || "";
            const village = addr.village || addr.hamlet || "";
            const district = addr.state_district || addr.county || "";

            form.setValue("city", city);
            form.setValue("district", district);
            form.setValue("state", addr.state || "");
            form.setValue("pincode", addr.postcode || "");
            form.setValue("country", addr.country || "India");
            form.setValue("village", village);

            // Construct a readable address string or use display_name
            const street = addr.road || addr.pedestrian || "";
            const area = addr.suburb || addr.neighbourhood || "";
            const fullAddress = [street, area].filter(Boolean).join(", ");
            form.setValue(
              "address",
              fullAddress || data.display_name.split(",")[0],
            );

            toast.success("Location and address detected!", {
              id: loadingToast,
            });
          } else {
            toast.warning("Location detected, but address not found.", {
              id: loadingToast,
            });
          }
        } catch (error) {
          console.error("Geocoding error:", error);
          toast.error(
            "Could not fetch address details. Please enter manually.",
            { id: loadingToast },
          );
        }
      },
      (error) => {
        // More specific error handling
        if (error.code === error.PERMISSION_DENIED) {
          toast.error(
            "Location permission denied. Please enable it in browser settings.",
          );
        } else if (error.code === error.TIMEOUT) {
          toast.error("Location request timed out.");
        } else {
          toast.error(
            "Unable to retrieve accurate location. Please fill manually.",
          );
        }
        console.error(error);
      },
      // Added Options for High Accuracy
      {
        enableHighAccuracy: true, // Forces GPS usage if available
        timeout: 15000, // Wait up to 15s for satellite lock
        maximumAge: 0, // Do not use cached position
      },
    );
  };

  const onSubmit = async (values: CreateLocationInputType) => {
    const toastId = toast.loading("Saving Location Details...");

    try {
      // Get user ID from route context
      if (!auth?.user?.id) {
        toast.error("User not authenticated", { id: toastId });
        return;
      }

      // Submit location data using Hono RPC client
      const response = await postuserlocation(values);
      if (!response.ok) {
        const errorData = await response.json();
        const errorMessage =
          (errorData as Record<string, unknown>).error ||
          (errorData as Record<string, unknown>).message ||
          "Failed to save location";
        toast.error(errorMessage as unknown as string, { id: toastId });
        return;
      }

      const data = await response.json();

      if (data.success) {
        toast.success(data.message || "Location saved successfully!", {
          id: toastId,
        });
        // Navigate to dashboard after success
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
        <CardHeader className="text-3xl font-bold text-primary space-y-2">
          <CardTitle>
            {authType === "sign-up" ? "Final Step" : "Location Required"}
          </CardTitle>
          <CardDescription>
            We need your location to connect you with nearby services in Cropia.
          </CardDescription>
        </CardHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col gap-4"
          >
            <CardContent className="space-y-4 text-primary/90 p-4">
              {/* Geolocation Section */}
              <div className="flex flex-col gap-2 bg-muted/50 rounded-lg ">
                <div className="flex items-center justify-between">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDetectLocation}
                    className="gap-2 text-xs"
                  >
                    <MapPin className="h-3 w-3" /> Detect My Location
                  </Button>
                </div>
                <div className="flex gap-2">
                  <FormField
                    control={form.control}
                    name="latitude"
                    render={({ field }) => (
                      <FormItem className="w-1/2">
                        <FormControl>
                          <Input
                            placeholder="Lat"
                            {...field}
                            readOnly
                            className="bg-background/50"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="longitude"
                    render={({ field }) => (
                      <FormItem className="w-1/2">
                        <FormControl>
                          <Input
                            placeholder="Long"
                            {...field}
                            readOnly
                            className="bg-background/50"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Address Fields */}
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Street Address</FormLabel>
                    <FormControl>
                      <Input placeholder="House No, Street Area" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Village / City</FormLabel>
                      <FormControl>
                        <Input placeholder="Village / City" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="district"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>District</FormLabel>
                      <FormControl>
                        <Input placeholder="District" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="state"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>State</FormLabel>
                      <FormControl>
                        <Input placeholder="State" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="pincode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Pincode</FormLabel>
                      <FormControl>
                        <Input placeholder="Zip Code" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>

            <CardFooter className="w-full px-3 pt-2">
              <Button type="submit" className="w-full">
                Complete Setup
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </>
  );
}
