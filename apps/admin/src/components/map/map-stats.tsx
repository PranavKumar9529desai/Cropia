import { useMemo } from "react";
import { ScanSearch, Activity, AlertTriangle, CheckCircle2 } from "lucide-react";

interface MapStatsProps {
  data: any; // Filtered GeoJSON
}

export default function MapStats({ data }: MapStatsProps) {
  const stats = useMemo(() => {
    const features = data?.features || [];
    const counts = {
      total: features.length,
      healthy: 0,
      warning: 0,
      critical: 0,
    };

    features.forEach((f: any) => {
      const status = f.properties.status;
      if (status === "healthy") counts.healthy++;
      else if (status === "warning") counts.warning++;
      else if (status === "critical") counts.critical++;
    });

    return counts;
  }, [data]);

  if (stats.total === 0) return null;

  return (
    <div className="flex items-center gap-4 bg-background/80 backdrop-blur-md px-4 py-2 rounded-xl border shadow-sm">
      <div className="flex items-center gap-2">
        <ScanSearch className="h-4 w-4 text-primary" />
        <div className="flex flex-col">
          <span className="text-[10px] uppercase text-muted-foreground font-bold leading-none">Scans</span>
          <span className="text-sm font-bold">{stats.total}</span>
        </div>
      </div>
      
      <div className="h-8 w-px bg-border/50" />

      <div className="flex items-center gap-6">
        <div className="flex items-center gap-1.5" title="Critical">
          <Activity className="h-3.5 w-3.5 text-red-500" />
          <span className="text-xs font-bold text-red-500">{stats.critical}</span>
        </div>
        
        <div className="flex items-center gap-1.5" title="Warning">
          <AlertTriangle className="h-3.5 w-3.5 text-yellow-500" />
          <span className="text-xs font-bold text-yellow-500">{stats.warning}</span>
        </div>

        <div className="flex items-center gap-1.5" title="Healthy">
          <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
          <span className="text-xs font-bold text-green-500">{stats.healthy}</span>
        </div>
      </div>
    </div>
  );
}
