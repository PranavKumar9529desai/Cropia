import { MapPin, Sparkles, Loader2 } from "lucide-react";
import {
  getJurisdictionDisplay,
  type Jurisdiction,
} from "@/lib/get-jurisdiction";
import { Button } from "@repo/ui/components/button";

interface AreaScanHeaderProps {
  jurisdiction?: Jurisdiction | Record<string, string> | null;
  onRunAnalysis: () => void;
  isAnalyzing: boolean;
}

export default function AreaScanHeader({
  jurisdiction,
  onRunAnalysis,
  isAnalyzing,
}: AreaScanHeaderProps) {
  const displayLocation =
    getJurisdictionDisplay(jurisdiction) || "National Scope";

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
    <div className="flex flex-col gap-4 py-6 mb-6 border-b border-border/20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-foreground/90">
              Regional Health Analytics
            </h1>
            <div className="h-2 w-2 rounded-full bg-green-500 shadow-[0_0_10px_rgba(59,130,246,0.5)] animate-pulse" />
          </div>
          <p className="text-xs font-medium text-muted-foreground/60 uppercase tracking-widest flex items-center gap-2">
            <MapPin className="h-3 w-3" />
            {locationPath}
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden md:flex flex-col items-end">
            <span className="text-sm font-semibold text-foreground/70">
              {displayLocation}
            </span>
            <span className="text-[10px] text-muted-foreground">
              Current Jurisdiction
            </span>
          </div>

          <Button
            onClick={onRunAnalysis}
            disabled={isAnalyzing}
            className="bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20 transition-all active:scale-95"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Run AI Analysis
              </>
            )}
          </Button>
        </div>
      </div>
      <p className="text-sm text-muted-foreground max-w-2xl">
        Generate deep insights using satellite and field scan data. Our AI agent
        will process recent records to identify trends, budding outbreaks, and
        health scores for this region.
      </p>
    </div>
  );
}
