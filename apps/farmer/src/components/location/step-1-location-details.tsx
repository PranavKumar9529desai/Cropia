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
import { CreateLocationInputType } from "../../utils/user-location";
import { useLocationHierarchy } from "../../hooks/use-location-hierarchy";

interface Step1AdminDetailsProps {
  form: UseFormReturn<CreateLocationInputType>;
}

export function Step1AdminDetails({ form }: Step1AdminDetailsProps) {
  const selectedState = form.watch("state");
  const selectedDistrict = form.watch("district");
  const selectedTaluka = form.watch("taluka");

  const {
    states,
    districts,
    talukas,
    villages,
    isLoadingStates,
    isLoadingDistricts,
    isLoadingTalukas,
    isLoadingVillages,
  } = useLocationHierarchy({
    selectedState,
    selectedDistrict,
    selectedTaluka,
  });

  return (
    <div className="space-y-4">
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
                value={field.value}
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
                    <SelectItem key={`${state.code}_${i}`} value={state.name}>
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
                value={field.value}
                disabled={!selectedState}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue
                      placeholder={
                        isLoadingDistricts ? "Loading..." : "Select District"
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
                  // form.setValue("village", ""); // Optional: Reset village if taluka changes
                }}
                value={field.value}
                disabled={!selectedDistrict}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue
                      placeholder={
                        isLoadingTalukas ? "Loading..." : "Select Taluka"
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
                value={field.value}
                disabled={!selectedTaluka}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue
                      placeholder={
                        isLoadingVillages ? "Loading..." : "Select Village"
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
    </div>
  );
}
