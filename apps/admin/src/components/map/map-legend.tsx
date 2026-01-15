import { Info } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@repo/ui/components/tooltip";

export default function MapLegend() {
  const items = [
    { label: "Healthy", color: "bg-green-500", desc: "No issues detected" },
    { label: "Warning", color: "bg-yellow-500", desc: "Potential stress or early signs" },
    { label: "Critical", color: "bg-red-500", desc: "Disease/Pest alert detected" },
  ];

  return (
    <div className="bg-background/80 backdrop-blur-md p-3 rounded-xl border shadow-sm flex flex-col gap-2">
      <div className="flex items-center gap-1.5 mb-1">
        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Legend</span>
      </div>
      <div className="flex flex-col gap-2">
        {items.map((item) => (
          <TooltipProvider key={item.label}>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-2 cursor-help group">
                  <div className={`h-2.5 w-2.5 rounded-full ${item.color} group-hover:scale-110 transition-transform`} />
                  <span className="text-xs font-medium text-foreground/80">{item.label}</span>
                </div>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p>{item.desc}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ))}
      </div>
    </div>
  );
}
