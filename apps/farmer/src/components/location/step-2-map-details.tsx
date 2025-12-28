import { UseFormReturn } from "react-hook-form";
import { MapPin } from "lucide-react";
import { toast } from "@repo/ui/components/sonner";
import { Button } from "@repo/ui/components/button";
import { Input } from "@repo/ui/components/input";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@repo/ui/components/form";
import {
  CreateLocationInputType,
  reverseGeocode,
} from "../../utils/user-location";
import { LocationPicker } from "./location-picker";

interface Step2MapDetailsProps {
  form: UseFormReturn<CreateLocationInputType>;
}

export function Step2MapDetails({ form }: Step2MapDetailsProps) {
  const handleReverseGeocode = async (lat: number, lng: number) => {
    const data = await reverseGeocode(lat, lng);
    if (!data) return;

    // Only update pincode as per user request. Step 1 values (State/District/etc) are authority.
    if (data.pincode) {
      form.setValue("pincode", data.pincode, { shouldValidate: true });
    }

    if (data.address) {
      form.setValue("address", data.address, { shouldValidate: true });
    }

    toast.info("Address & Pincode updated from map position.");
  };

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

        toast.message("Location detected. Values auto-filled where possible.");
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

  return (
    <div className="flex flex-col gap-2 bg-muted/30 p-3 rounded-xl space-y-3 border ">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <h3 className="text-sm font-semibold flex items-center gap-2">
            Exact Coordinates
          </h3>
          <p className="text-[10px] text-muted-foreground">
            Coordinates will be saved for map analysis.
          </p>
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
                  <span className="text-[10px] font-bold text-muted-foreground mr-1">
                    LAT
                  </span>
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
                  <span className="text-[10px] font-bold text-muted-foreground mr-1">
                    LNG
                  </span>
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

      {/* Address and Pincode */}
      <div className="grid grid-cols-1 gap-4">
        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Address / Landmark</FormLabel>
              <FormControl>
                <Input
                  placeholder="Near Village Temple..."
                  {...field}
                  className="bg-muted text-foreground"
                />
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
                <Input
                  placeholder="Zip Code"
                  {...field}
                  className="bg-muted text-foreground"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}
