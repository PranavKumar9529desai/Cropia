import * as React from "react";
import { UseFormReturn } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@repo/ui/components/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/components/select";
import { Input } from "@repo/ui/components/input";
import { toast } from "@repo/ui/components/sonner";
import { Loader2 } from "lucide-react";
import {
  CreateLocationInputType,
  getLocationByPincode,
} from "../../utils/user-location";

interface Step1AdminDetailsProps {
  form: UseFormReturn<CreateLocationInputType>;
}

export function Step1AdminDetails({ form }: Step1AdminDetailsProps) {
  const [villages, setVillages] = React.useState<string[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);

  // Watch for pincode changes to trigger fetch manually or via blur
  // We'll primarily use onBlur for efficiency, or a manual button if needed.
  // But strictly per requirements: "farmer will the type the pincode and we will auto the all the fileds"

  const handlePincodeChange = async (pincode: string) => {
    if (pincode.length !== 6) return;

    setIsLoading(true);
    // Reset fields
    setVillages([]);
    form.setValue("state", "");
    form.setValue("district", "");
    form.setValue("taluka", "");
    form.setValue("country", "India");
    form.setValue("village", "");

    // Clear any previous errors
    form.clearErrors("pincode");

    try {
      toast.info("Fetching location details...");
      const data = await getLocationByPincode(pincode);

      if (data) {
        form.setValue("state", data.state);
        form.setValue("district", data.district);
        form.setValue("taluka", data.taluka);
        form.setValue("country", data.country);

        // Update village list
        setVillages(data.villages);

        toast.success("Location details found!");
      }
    } catch (error) {
      console.error(error);
      form.setError("pincode", {
        type: "manual",
        message: "Invalid Pincode or no data found.",
      });
      toast.error("Could not fetch details for this Pincode.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Pincode Field */}
      <FormField
        control={form.control}
        name="pincode"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Pincode</FormLabel>
            <div className="relative">
              <FormControl>
                <Input
                  placeholder="Enter 6-digit Pincode"
                  maxLength={6}
                  {...field}
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^0-9]/g, "");
                    field.onChange(value);
                    if (value.length === 6) {
                      handlePincodeChange(value);
                    }
                  }}
                  className="pr-10"
                />
              </FormControl>
              {isLoading && (
                <div className="absolute right-3 top-2.5">
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                </div>
              )}
            </div>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* State and District (Read-Only) */}
      <div className="grid grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="state"
          render={({ field }) => (
            <FormItem>
              <FormLabel>State</FormLabel>
              <FormControl>
                <Input {...field} readOnly className="bg-muted text-muted-foreground cursor-not-allowed" placeholder="Auto-filled" />
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
                <Input {...field} readOnly className="bg-muted text-muted-foreground cursor-not-allowed" placeholder="Auto-filled" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {/* Taluka (Read-Only) and Village (Select) */}
      <div className="grid grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="taluka"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Sub-District</FormLabel>
              <FormControl>
                <Input {...field} readOnly className="bg-muted text-muted-foreground cursor-not-allowed" placeholder="Auto-filled" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="village"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Village / Post Office</FormLabel>
              <Select
                onValueChange={field.onChange}
                value={field.value}
                disabled={villages.length === 0}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue
                      placeholder={
                        villages.length === 0
                          ? "Enter Pincode first"
                          : "Select Village"
                      }
                    />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className="max-h-[200px]">
                  {villages.map((v, i) => (
                    <SelectItem key={`${v}_${i}`} value={v}>
                      {v}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}
