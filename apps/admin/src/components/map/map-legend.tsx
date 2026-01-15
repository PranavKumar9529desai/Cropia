import { Info, HelpCircle } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@repo/ui/components/tooltip";
import { useIsMobile } from "@repo/ui/hooks/use-mobile";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@repo/ui/components/popover";
import { Button } from "@repo/ui/components/button";

export default function MapLegend() {
  const isMobile = useIsMobile();
  const items = [
    { label: "Healthy", color: "bg-green-500", desc: "No issues detected" },
    { label: "Warning", color: "bg-yellow-500", desc: "Potential stress or early signs" },
    { label: "Critical", color: "bg-red-500", desc: "Disease/Pest alert detected" },
  ];

  const LegendContent = () => (
    <div className={`p-1 flex flex-col gap-2 ${isMobile ? '' : 'bg-background/80 backdrop-blur-md p-3 rounded-xl border shadow-sm'}`}>
      {!isMobile && (
        <div className="flex items-center gap-1.5 mb-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Legend</span>
        </div>
      )}
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
              <TooltipContent side={isMobile ? "top" : "right"}>
                <p>{item.desc}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ))}
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" size="icon" className="h-10 w-10 rounded-full bg-background/80 backdrop-blur-md shadow-sm">
            <HelpCircle className="h-5 w-5 text-muted-foreground" />
          </Button>
        </PopoverTrigger>
        <PopoverContent side="bottom" align="start" className="w-40 p-3 rounded-xl">
          <div className="flex flex-col gap-1 mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Map Legend</span>
          </div>
          <LegendContent />
        </PopoverContent>
      </Popover>
    );
  }

  return <LegendContent />;
}
