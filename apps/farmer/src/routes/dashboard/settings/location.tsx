import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from '@repo/ui/components/sonner'
import { Button } from '@repo/ui/components/button'
import { Form } from '@repo/ui/components/form'
import { Loader2, MapPin, Save } from 'lucide-react'
import {
  createLocationSchema,
  CreateLocationInputType,
  getuserlocation,
  postuserlocation,
  forwardGeocode
} from '@/utils/user-location'
import { Step1AdminDetails } from '@/components/location/step-1-location-details'
import { Step2MapDetails } from '@/components/location/step-2-map-details'

export const Route = createFileRoute('/dashboard/settings/location')({
  component: LocationSettings,
  loader: async () => {
    try {
      const data = await getuserlocation();
      return data;
    } catch (error) {
      console.error("Failed to load location data", error);
      return null;
    }
  }
})

function LocationSettings() {
  // @ts-ignore
  const locationData = Route.useLoaderData()
  const [isSaving, setIsSaving] = useState(false)
  const [isLocating, setIsLocating] = useState(false)

  const form = useForm<CreateLocationInputType>({
    resolver: zodResolver(createLocationSchema),
    defaultValues: {
      country: "India",
      latitude: locationData?.latitude || 0,
      longitude: locationData?.longitude || 0,
      address: locationData?.address || "",
      village: locationData?.village || "",
      district: locationData?.district || "",
      state: locationData?.state || "",
      taluka: locationData?.taluka || "",
      pincode: locationData?.pincode || "",
    },
  })

  // No useEffect needed anymore as data is pre-loaded

  const handleLocate = async () => {
    const fieldsToValidate: (keyof CreateLocationInputType)[] = [
      "state",
      "district",
      "taluka",
      "village",
    ];
    const isValid = await form.trigger(fieldsToValidate);

    if (isValid) {
      setIsLocating(true)
      const state = form.getValues("state");
      const district = form.getValues("district");
      const taluka = form.getValues("taluka");
      const village = form.getValues("village");

      const query = `${village ? village + ", " : ""}${taluka ? taluka + ", " : ""}${district}, ${state}, India`;

      try {
        const coords = await forwardGeocode(query);

        if (coords) {
          form.setValue("latitude", coords.lat);
          form.setValue("longitude", coords.lng);
          toast.success("Map centered on selected area")
        } else {
          toast.info("Could not find exact location, please pin manually")
        }
      } catch (error) {
        toast.error("Failed to locate area")
      } finally {
        setIsLocating(false)
      }
    } else {
      toast.error("Please fill administrative details first")
    }
  }

  const onSubmit = async (values: CreateLocationInputType) => {
    setIsSaving(true)
    try {
      const response = await postuserlocation(values)
      // @ts-ignore
      if (response.ok) {
        toast.success("Location updated successfully")
      } else {
        toast.error("Failed to update location")
      }
    } catch (error) {
      toast.error("An error occurred while saving")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="w-full max-w-7xl space-y-8  pb-10 ">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">

          {/* Administrative Area Section */}
          <div className="flex flex-col lg:flex-row gap-8 border-b pb-8">
            <div className="lg:w-1/3 space-y-2">
              <h3 className="text-lg font-medium">Administrative Area</h3>
              <p className="text-sm text-muted-foreground">
                Define the administrative region of your farm.
              </p>
            </div>
            <div className="lg:w-2/3">
              <div className="flex flex-col gap-6">
                <Step1AdminDetails form={form} />
                <div className="flex justify-end">
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={handleLocate}
                    disabled={isLocating}
                  >
                    {isLocating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <MapPin className="w-4 h-4 mr-2" />}
                    Locate on Map
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Map Location Section */}
          <div className="flex flex-col lg:flex-row gap-8 ">
            <div className="lg:w-1/3 space-y-2">
              <h3 className="text-lg font-medium">Pin Exact Location</h3>
              <p className="text-sm text-muted-foreground">
                Drag the pin to mark your exact farm location on the map.
              </p>
            </div>
            <div className="lg:w-2/3">
              <div className="space-y-6">
                <Step2MapDetails form={form} />
                <div className="flex justify-end pt-4 border-t">
                  <Button type="submit" disabled={isSaving}>
                    {isSaving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" /> Save Changes
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>

        </form>
      </Form>
    </div>
  )
}
