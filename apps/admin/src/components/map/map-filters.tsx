import { useSearch, useNavigate } from "@tanstack/react-router";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@repo/ui/components/select";
import { Badge } from "@repo/ui/components/badge";
import { Button } from "@repo/ui/components/button";
import { X, Filter, Crop, Thermometer } from "lucide-react";
import { useMemo } from "react";

interface MapFiltersProps {
    data: any; // GeoJSON
}

export default function MapFilters({ data }: MapFiltersProps) {
    const search = useSearch({ from: "/dashboard/crop-map" }) as any;
    const navigate = useNavigate();

    // Extract dynamic options from data
    const { crops, diseases } = useMemo(() => {
        const features = data?.features || [];
        const cropSet = new Set<string>();
        const diseaseSet = new Set<string>();

        features.forEach((f: any) => {
            if (f.properties.crop) cropSet.add(f.properties.crop);
            if (f.properties.disease) diseaseSet.add(f.properties.disease);
        });

        return {
            crops: Array.from(cropSet).sort(),
            diseases: Array.from(diseaseSet).sort(),
        };
    }, [data]);

    const setFilter = (key: string, value: string | undefined) => {
        navigate({
            search: (prev: any) => {
                const next = { ...prev };
                if (value && value !== "all") {
                    next[key] = value;
                } else {
                    delete next[key];
                }
                return next;
            },
        });
    };

    const clearFilters = () => {
        navigate({
            search: (prev: any) => ({}),
        });
    };

    const hasFilters = search.crop || search.disease || search.status;

    return (
        <div className="flex flex-wrap items-center gap-3 p-4 bg-muted/30 rounded-xl border border-border/40 backdrop-blur-sm">
            <div className="flex items-center gap-2 mr-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-semibold whitespace-nowrap">Filters</span>
            </div>

            {/* Crop Filter */}
            <div className="flex items-center gap-2">
                <Select
                    value={search.crop || "all"}
                    onValueChange={(val) => setFilter("crop", val)}
                >
                    <SelectTrigger className="h-9 w-[140px] bg-background border-border/50">
                        <Crop className="h-3.5 w-3.5 mr-2 text-primary/60" />
                        <SelectValue placeholder="All Crops" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Crops</SelectItem>
                        {crops.map((crop) => (
                            <SelectItem key={crop} value={crop}>
                                {crop}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* Disease Filter */}
            <div className="flex items-center gap-2">
                <Select
                    value={search.disease || "all"}
                    onValueChange={(val) => setFilter("disease", val)}
                >
                    <SelectTrigger className="h-9 w-[160px] bg-background border-border/50">
                        <Thermometer className="h-3.5 w-3.5 mr-2 text-red-500/60" />
                        <SelectValue placeholder="All Diseases" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Diseases</SelectItem>
                        {diseases.map((disease) => (
                            <SelectItem key={disease} value={disease}>
                                {disease}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* Severity Filter */}
            <div className="flex items-center gap-2">
                <Select
                    value={search.status || "all"}
                    onValueChange={(val) => setFilter("status", val)}
                >
                    <SelectTrigger className="h-9 w-[130px] bg-background border-border/50">
                        <div
                            className={`h-2 w-2 rounded-full mr-2 ${search.status === "healthy"
                                ? "bg-green-500"
                                : search.status === "warning"
                                    ? "bg-yellow-500"
                                    : search.status === "critical"
                                        ? "bg-red-500"
                                        : "bg-muted-foreground/40"
                                }`}
                        />
                        <SelectValue placeholder="Severity" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Any Severity</SelectItem>
                        <SelectItem value="healthy">Healthy</SelectItem>
                        <SelectItem value="warning">Warning</SelectItem>
                        <SelectItem value="critical">Critical</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Active Filters Display */}
            {hasFilters && (
                <div className="flex items-center gap-2 ml-auto">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={clearFilters}
                        className="h-8 text-xs text-muted-foreground hover:text-foreground"
                    >
                        <X className="h-3 w-3 mr-1" />
                        Clear
                    </Button>
                </div>
            )}
        </div>
    );
}
