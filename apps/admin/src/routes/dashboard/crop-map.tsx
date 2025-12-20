import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import CropMap from "../../components/map/crop.map";
import { apiClient } from "../../lib/rpc";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@repo/ui/components/dialog";
import { Button } from "@repo/ui/components/button";
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

      {/* Scan Detail Dialog */}
      <Dialog open={!!selectedScan} onOpenChange={() => setSelectedScan(null)}>
        <DialogContent className="sm:max-w-md w-[90%] rounded-lg overflow-hidden p-0 gap-0">
          {selectedScan?.thumbnail && (
            <div className="relative w-full h-48 bg-muted">
              <img
                src={getOptimizedUrl(selectedScan.thumbnail)}
                alt={selectedScan.crop}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <div className="absolute top-4 left-4">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold shadow-lg backdrop-blur-md ${selectedScan.status === "healthy"
                    ? "bg-green-500/80 text-white"
                    : selectedScan.status === "warning"
                      ? "bg-yellow-500/80 text-white"
                      : "bg-red-500/80 text-white"
                    }`}
                >
                  {selectedScan.status.toUpperCase()}
                </span>
              </div>
            </div>
          )}

          <div className="p-6 pt-4 flex flex-col gap-4">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold flex items-center justify-between">
                <span>Scan Details</span>
                <span className="text-sm font-normal text-muted-foreground">
                  {new Date(selectedScan?.date).toLocaleDateString()}
                </span>
              </DialogTitle>
              <DialogDescription>
                Detailed information about the selected crop scan.
              </DialogDescription>
            </DialogHeader>

            {selectedScan && (
              <div className="space-y-4">
                {/* Status-specific highlight */}
                <div
                  className={`p-4 rounded-lg border ${selectedScan.status === "healthy"
                    ? "bg-green-50 border-green-200"
                    : selectedScan.status === "warning"
                      ? "bg-yellow-50 border-yellow-200"
                      : "bg-red-50 border-red-200"
                    }`}
                >
                  <h4
                    className={`font-semibold mb-1 flex items-center gap-2 ${selectedScan.status === "healthy"
                      ? "text-green-800"
                      : selectedScan.status === "warning"
                        ? "text-yellow-800"
                        : "text-red-800"
                      }`}
                  >
                    {selectedScan.crop}
                  </h4>
                  <p
                    className={`text-sm ${selectedScan.status === "healthy"
                      ? "text-green-700"
                      : selectedScan.status === "warning"
                        ? "text-yellow-700"
                        : "text-red-700"
                      }`}
                  >
                    {selectedScan.disease}
                  </p>
                </div>

                {/* Additional Info */}
                <div className="grid grid-cols-1 gap-3">
                  <div className="bg-muted/30 p-3 rounded-lg border">
                    <p className="text-xs font-semibold text-muted-foreground uppercase mb-1">
                      Visual Observation
                    </p>
                    <p className="text-sm text-foreground">
                      {selectedScan.visualIssue}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 px-1 text-sm text-muted-foreground line-clamp-1">
                    <MapPin className="h-4 w-4 shrink-0 text-primary" />
                    <span>{selectedScan.locationText}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2 pt-2">
                  {/* <Button
                    className="w-full"
                    onClick={() => {
                      // Logic for analysis can go here
                    }}
                  >
                    <Search className="h-4 w-4 mr-2" />
                    Analyze Further
                  </Button> */}
                  <Button
                    variant="ghost"
                    className="w-full bg-primary text-white"
                    onClick={() => setSelectedScan(null)}
                  >
                    Close
                  </Button>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
