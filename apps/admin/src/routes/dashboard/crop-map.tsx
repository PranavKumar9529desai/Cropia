import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
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
import { MapPin } from "lucide-react";
import calculateViewState from "@/components/map/map.helper";
import CropScanHeader from "../../components/map/crop-scan-header";

export const Route = createFileRoute("/dashboard/crop-map")({
  loader: async ({ context }) => {
    const res = await apiClient.api.admin.map.scans.$get();
    if (!res.ok) {
      throw new Error("Failed to fetch map data");
    }
    const data = await res.json();
    const defaultView = calculateViewState(data);
    return {
      data: data || { type: "FeatureCollection", features: [] },
      defaultView,
      jurisdiction: context.auth?.session.jurisdiction,
    };
  },
  component: RouteComponent,
});

function RouteComponent() {
  const { data, defaultView, jurisdiction } = Route.useLoaderData();
  const [selectedScan, setSelectedScan] = useState<any>(null);

  // Function to optimize Cloudinary URL
  const getOptimizedUrl = (url: string) => {
    if (!url) return "";
    if (url.includes("cloudinary.com")) {
      return url.replace("/upload/", "/upload/q_auto,f_auto,w_800/");
    }
    return url;
  };

  return (
    <div className="container mx-auto p-4 md:p-8 max-w-7xl animate-in fade-in duration-500 space-y-4">
      <CropScanHeader jurisdiction={jurisdiction} />

      {/* Map Container */}
      <div className="rounded-xl border bg-card text-card-foreground shadow overflow-hidden">
        <CropMap
          data={data}
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
