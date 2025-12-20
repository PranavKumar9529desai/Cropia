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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/components/select";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { toast } from "@repo/ui/components/sonner";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { MapPin } from "lucide-react";
import {
  getStates,
  getDistricts,
  getTalukas,
  getVillages,
  postuserlocation,
} from "../../utils/user-location";
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
  taluka: z.string().optional(), // Added Taluka
  pincode: z.string().min(1, "Pincode is required"),
  country: z.string(),
});

type CreateLocationInputType = z.infer<typeof createLocationSchema>;

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

  const [states, setStates] = React.useState<any[]>([]);
  const [districts, setDistricts] = React.useState<any[]>([]);
  const [talukas, setTalukas] = React.useState<any[]>([]);
  const [villages, setVillages] = React.useState<any[]>([]);

  const [isLoadingStates, setIsLoadingStates] = React.useState(false);
  const [isLoadingDistricts, setIsLoadingDistricts] = React.useState(false);
  const [isLoadingTalukas, setIsLoadingTalukas] = React.useState(false);
  const [isLoadingVillages, setIsLoadingVillages] = React.useState(false);

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
      taluka: "",
      pincode: "",
    },
  });

  const selectedState = form.watch("state");
  const selectedDistrict = form.watch("district");
  const selectedTaluka = form.watch("taluka");

  // Fetch States on Mount
  React.useEffect(() => {
    const fetchStatesData = async () => {
      setIsLoadingStates(true);
      try {
        const statesData = await getStates();
        setStates(statesData);
      } catch (error) {
        console.error("Error fetching states:", error);
        toast.error("Failed to load states");
      } finally {
        setIsLoadingStates(false);
      }
    };
    fetchStatesData();
  }, []);

  // Fetch Districts when State changes
  React.useEffect(() => {
    if (!selectedState) {
      setDistricts([]);
      return;
    }
    const fetchDistrictsData = async () => {
      const stateObj = states.find((s) => s.name === selectedState);
      if (!stateObj) return;

      setIsLoadingDistricts(true);
      try {
        const districtsData = await getDistricts(stateObj.name);
        setDistricts(districtsData);
      } catch (error) {
        console.error(error);
        toast.error("Failed to load districts");
      } finally {
        setIsLoadingDistricts(false);
      }
    };
    fetchDistrictsData();
  }, [selectedState, states]);

  // Fetch Talukas when District changes
  React.useEffect(() => {
    if (!selectedDistrict) {
      setTalukas([]);
      return;
    }
    const fetchTalukasData = async () => {
      const districtObj = districts.find((d) => d.name === selectedDistrict);
      if (!districtObj) return;

      setIsLoadingTalukas(true);
      try {
        const talukasData = await getTalukas(districtObj.name);
        setTalukas(talukasData);
      } catch (error) {
        console.error(error);
        toast.error("Failed to load talukas");
      } finally {
        setIsLoadingTalukas(false);
      }
    };
    fetchTalukasData();
  }, [selectedDistrict, districts]);

  // Fetch Villages when Taluka changes
  React.useEffect(() => {
    if (!selectedTaluka || !selectedDistrict || !selectedState) {
      setVillages([]);
      return;
    }
    const fetchVillagesData = async () => {
      setIsLoadingVillages(true);
      try {
        const villagesData = await getVillages(
          selectedState,
          selectedDistrict,
          selectedTaluka,
        );
        setVillages(villagesData);
      } catch (error) {
        console.error(error);
        toast.error("Failed to load villages");
      } finally {
        setIsLoadingVillages(false);
      }
    };
    fetchVillagesData();
  }, [selectedTaluka, selectedDistrict, selectedState]);

  // 3. Geolocation Helper
  const handleDetectLocation = (e: React.MouseEvent) => {
    e.preventDefault();

    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser");
      return;
    }

    toast.info("Detecting location (High Accuracy)...");

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const long = position.coords.longitude;

        form.setValue("latitude", lat);
        form.setValue("longitude", long);

        // Reverse decoding could still be useful for Pincode/Address but we want users to select strict hierarchy
        toast.message(
          "Location detected. Please select your Region details manually for accuracy.",
        );
      },
      (error) => {
        console.error(error);
        toast.error("Unable to retrieve accurate location.");
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0,
      },
    );
  };

  const onSubmit = async (values: CreateLocationInputType) => {
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
          errorMessage = (errorData as any).error || errorMessage;
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
            We need your exact location to connect you with nearby services.
          </CardDescription>
        </CardHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col gap-4"
          >
            <CardContent className="space-y-4 text-primary/90 p-4">
              {/* Geolocation Section */}
              <div className="flex flex-col gap-2 bg-muted/50 rounded-lg space-y-2">
                <div className="flex items-center justify-between">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDetectLocation}
                    className="gap-2 text-xs text-primary"
                  >
                    <MapPin className="h-3 w-3" /> Detect GPS Coords
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
                            className="bg-muted text-foreground text-xs"
                          />
                        </FormControl>
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
                            className="bg-muted text-foreground text-xs"
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* State and District */}
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="state"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>State</FormLabel>
                      <Select
                        onValueChange={(value) => {
                          field.onChange(value);
                          form.setValue("district", "");
                          form.setValue("taluka", "");
                          form.setValue("village", "");
                        }}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue
                              placeholder={
                                isLoadingStates ? "Loading..." : "Select State"
                              }
                            />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="max-h-[200px]">
                          {states.map((state, i) => (
                            <SelectItem
                              key={`${state.code}_${i}`}
                              value={state.name}
                            >
                              {state.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
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
                      <Select
                        onValueChange={(value) => {
                          field.onChange(value);
                          form.setValue("taluka", "");
                          form.setValue("village", "");
                        }}
                        defaultValue={field.value}
                        disabled={!selectedState}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue
                              placeholder={
                                isLoadingDistricts
                                  ? "Loading..."
                                  : "Select District"
                              }
                            />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="max-h-[200px]">
                          {districts.map((d, i) => (
                            <SelectItem key={`${d.code}_${i}`} value={d.name}>
                              {d.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Taluka and Village */}
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="taluka"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Taluka</FormLabel>
                      <Select
                        onValueChange={(value) => {
                          field.onChange(value);
                          form.setValue("village", "");
                        }}
                        defaultValue={field.value}
                        disabled={!selectedDistrict}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue
                              placeholder={
                                isLoadingTalukas
                                  ? "Loading..."
                                  : "Select Taluka"
                              }
                            />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="max-h-[200px]">
                          {talukas.map((t, i) => (
                            <SelectItem key={`${t.code}_${i}`} value={t.name}>
                              {t.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="village"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Village</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        disabled={!selectedTaluka}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue
                              placeholder={
                                isLoadingVillages
                                  ? "Loading..."
                                  : "Select Village"
                              }
                            />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="max-h-[200px]">
                          {villages.map((v, i) => (
                            <SelectItem key={`${v.code}_${i}`} value={v.name}>
                              {v.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* City (Manual?) and Pincode */}
              <div className="grid grid-cols-2 gap-4 ">
                <FormField
                  control={form.control}
                  name="city"

                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>City / Town</FormLabel>
                      <FormControl>
                        <Input placeholder="Nearest City" {...field} className="bg-muted text-foreground" />
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
                        <Input placeholder="Zip Code" {...field} className="bg-muted text-foreground" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Address Fields */}
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address Detail</FormLabel>
                    <FormControl>
                      <Input placeholder="House No, Street Area" {...field} className="bg-muted text-foreground" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
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
