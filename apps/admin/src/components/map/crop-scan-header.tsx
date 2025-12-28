import { MapPin } from "lucide-react";
import {
  getJurisdictionDisplay,
  type Jurisdiction,
} from "@/lib/get-jurisdiction";

interface CropScanHeaderProps {
  jurisdiction?: Jurisdiction | Record<string, any> | null;
}

export default function CropScanHeader({ jurisdiction }: CropScanHeaderProps) {
  const displayLocation =
    getJurisdictionDisplay(jurisdiction) || "National Scope";

  // Extract specific levels for a simple location string
  const levels = [];
  if (jurisdiction?.state && jurisdiction.state !== "All")
    levels.push(jurisdiction.state);
  if (jurisdiction?.district && jurisdiction.district !== "All")
    levels.push(jurisdiction.district);
  if (jurisdiction?.taluka && jurisdiction.taluka !== "All")
    levels.push(jurisdiction.taluka);
  if (jurisdiction?.village && jurisdiction.village !== "All")
    levels.push(jurisdiction.village);

  const locationPath = levels.join(" • ") || "Global territory";

  return (
    <div className="flex flex-col gap-2 py-4 mb-4 border-b border-border/20">
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-foreground/90">
              Crop Scan Map
            </h1>
            <div className="h-1.5 w-1.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]" />
          </div>
          <p className="text-[11px] font-medium text-muted-foreground/60 uppercase tracking-widest">
            {locationPath}
          </p>
        </div>

        <div className="flex items-center gap-1.5 text-right">
          <MapPin className="h-3.5 w-3.5 text-primary/60" />
          <span className="text-sm font-semibold text-foreground/70">
            {displayLocation}
          </span>
        </div>
      </div>
    </div>
  );
}
