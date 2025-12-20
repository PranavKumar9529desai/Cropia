import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import CropMap from "../../components/map/crop.map";
import { apiClient } from "../../lib/rpc";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@repo/ui/components/sheet";
import { Calendar, MapPin, Search } from "lucide-react";

export const Route = createFileRoute("/dashboard/crop-map")({
  component: RouteComponent,
});

// Helper to calculate view state from GeoJSON data
function calculateViewState(data: any) {
  if (!data || !data.features || data.features.length === 0) {
    return null;
  }

  let minLng = 180;
  let maxLng = -180;
  let minLat = 90;
  let maxLat = -90;

  data.features.forEach((feature: any) => {
    const [lng, lat] = feature.geometry.coordinates;
    if (lng < minLng) minLng = lng;
    if (lng > maxLng) maxLng = lng;
    if (lat < minLat) minLat = lat;
    if (lat > maxLat) maxLat = lat;
  });

  return {
    longitude: (minLng + maxLng) / 2,
    latitude: (minLat + maxLat) / 2,
    zoom: 9, // Default zoom for now, user can zoom in/out
  };
}

function RouteComponent() {
  const [data, setData] = useState<any>(null); // GeoJSON format
  const [loading, setLoading] = useState(true);
  const [selectedScan, setSelectedScan] = useState<any>(null);
  const [defaultView, setDefaultView] = useState<
    { longitude: number; latitude: number; zoom: number } | undefined
  >(undefined);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await apiClient.api.admin.map.scans.$get();
        if (res.ok) {
          const json = await res.json();
          setData(json);
          const view = calculateViewState(json);
          if (view) {
            setDefaultView(view);
          }
        }
      } catch (error) {
        console.error("Failed to fetch map data", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  // Function to optimize Cloudinary URL
  const getOptimizedUrl = (url: string) => {
    if (!url) return "";
    if (url.includes("cloudinary.com")) {
      return url.replace("/upload/", "/upload/q_auto,f_auto,w_800/");
    }
    return url;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-2xl font-bold tracking-tight">Crop Scan Map</h1>

      {/* Map Container */}
      <div className="rounded-xl border bg-card text-card-foreground shadow overflow-hidden">
        <CropMap
          data={data || { type: "FeatureCollection", features: [] }}
          defaultView={defaultView}
          onPointClick={(props) => setSelectedScan(props)}
        />
      </div>

      {/* Scan Detail Drawer */}
      <Sheet open={!!selectedScan} onOpenChange={() => setSelectedScan(null)}>
        <SheetContent className="sm:max-w-md overflow-y-auto">
          <SheetHeader className="pb-4">
            <SheetTitle className="text-xl font-bold">Scan Details</SheetTitle>
            <SheetDescription>
              Detailed information about the selected crop scan.
            </SheetDescription>
          </SheetHeader>

          {selectedScan && (
            <div className="space-y-6">
              {/* Optimized Image */}
              <div className="relative aspect-video rounded-lg overflow-hidden border bg-muted">
                <img
                  src={getOptimizedUrl(selectedScan.thumbnail)}
                  alt={selectedScan.crop}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-2 right-2">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-xs font-semibold shadow-sm ${selectedScan.status === "healthy"
                        ? "bg-green-100 text-green-800 border border-green-200"
                        : "bg-red-100 text-red-800 border border-red-200"
                      }`}
                  >
                    {selectedScan.status.toUpperCase()}
                  </span>
                </div>
              </div>

              {/* Data Grid */}
              <div className="grid grid-cols-1 gap-4">
                <div className="p-4 rounded-lg bg-secondary/30 border space-y-1">
                  <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Crop Type
                  </div>
                  <div className="text-lg font-bold text-primary">
                    {selectedScan.crop}
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-secondary/30 border space-y-1">
                  <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Diagnosis / Issue
                  </div>
                  <div className="text-lg font-bold text-foreground">
                    {selectedScan.disease}
                  </div>
                </div>

                <div className="flex items-center gap-3 p-2 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4 text-primary" />
                  <span>{selectedScan.locationText}</span>
                </div>

                <div className="flex items-center gap-3 p-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4 text-primary" />
                  <span>{new Date(selectedScan.date).toLocaleString()}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 flex flex-col gap-2">
                {/* We can add a "View Full Report" button here later */}
                <button className="flex items-center justify-center gap-2 w-full py-2.5 px-4 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors">
                  <Search className="h-4 w-4" />
                  Analyze Further
                </button>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
