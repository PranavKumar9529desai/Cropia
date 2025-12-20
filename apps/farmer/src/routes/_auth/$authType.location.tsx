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
  reverseGeocode,
  forwardGeocode,
} from "../../utils/user-location";
import { authClient } from "../../lib/auth/auth-client";
import { LocationPicker } from "../../components/location/location-picker";

// 1. Route Param Validation
const paramsType = z.enum(["sign-in", "sign-up"]);

const createLocationSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  address: z.string().optional(),
  village: z.string().optional(),
  city: z.string().optional(),
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

  // 1.5 Step state
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

        form.setValue("latitude", lat, { shouldValidate: true });
        form.setValue("longitude", long, { shouldValidate: true });

        // Trigger reverse geocoding
        await handleReverseGeocode(lat, long);

        // Reverse decoding could still be useful for Pincode/Address but we want users to select strict hierarchy
        toast.message(
          "Location detected. Values auto-filled where possible.",
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

  const handleNext = async () => {
    // Validate fields for Step 1
    const fieldsToValidate: (keyof CreateLocationInputType)[] = ["state", "district", "taluka", "village"];
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
        toast.info("Could not find exact village, please pick on map", { id: toastId });
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

  const handleReverseGeocode = async (lat: number, lng: number) => {
    const data = await reverseGeocode(lat, lng);
    if (!data) return;

    if (data.state) form.setValue("state", data.state, { shouldValidate: true });
    // We don't auto-set district/taluka/village directly because they rely on 
    // internal database IDs/names which might not match exactly.
    // However, we can set City and Pincode which are manual inputs.
    if (data.city) form.setValue("city", data.city, { shouldValidate: true });
    if (data.pincode) form.setValue("pincode", data.pincode, { shouldValidate: true });
    if (data.address) form.setValue("address", data.address.split(",")[0], { shouldValidate: true });

    toast.info("Address details updated from map position.");
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
            <CardContent className="space-y-4 text-primary/90 p-4">
              {step === 1 ? (
                <>
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
                </>
              ) : (
                <>
                  {/* Geolocation Section */}
                  <div className="flex flex-col gap-2 bg-muted/30 p-3 rounded-xl space-y-3 border">
                    <div className="flex items-center justify-between">
                      <div className="flex flex-col gap-1">
                        <h3 className="text-sm font-semibold flex items-center gap-2">
                          Exact Coordinates
                        </h3>
                        <p className="text-[10px] text-muted-foreground">Coordinates will be saved for map analysis.</p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleDetectLocation}
                        className="gap-2 text-xs text-primary h-8"
                      >
                        <MapPin className="h-3 w-3" /> Detect GPS
                      </Button>
                    </div>

                    <LocationPicker
                      latitude={form.watch("latitude")}
                      longitude={form.watch("longitude")}
                      onLocationChange={async (lat, lng) => {
                        form.setValue("latitude", lat, { shouldValidate: true });
                        form.setValue("longitude", lng, { shouldValidate: true });
                        await handleReverseGeocode(lat, lng);
                      }}
                    />

                    <div className="flex gap-2">
                      <FormField
                        control={form.control}
                        name="latitude"
                        render={({ field }) => (
                          <FormItem className="w-1/2">
                            <FormControl>
                              <div className="flex items-center bg-muted rounded-md px-2 h-9 border">
                                <span className="text-[10px] font-bold text-muted-foreground mr-1">LAT</span>
                                <Input
                                  placeholder="Lat"
                                  {...field}
                                  readOnly
                                  className="bg-transparent border-none p-0 text-xs shadow-none focus-visible:ring-0"
                                />
                              </div>
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
                              <div className="flex items-center bg-muted rounded-md px-2 h-9 border">
                                <span className="text-[10px] font-bold text-muted-foreground mr-1">LNG</span>
                                <Input
                                  placeholder="Long"
                                  {...field}
                                  readOnly
                                  className="bg-transparent border-none p-0 text-xs shadow-none focus-visible:ring-0"
                                />
                              </div>
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  {/* City (Manual?) and Pincode */}
                  <div className="grid grid-cols-1 gap-4 ">
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

                </>
              )}
            </CardContent>

            <CardFooter className="w-full flex gap-3 px-3 pt-2">
              {step === 1 ? (
                <Button type="button" onClick={handleNext} className="w-full">
                  Next Step
                </Button>
              ) : (
                <>
                  <Button type="button" variant="outline" onClick={handleBack} className="w-1/3">
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