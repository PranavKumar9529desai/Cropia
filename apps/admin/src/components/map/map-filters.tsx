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
import { X, Filter, Crop, Thermometer, ChevronRight } from "lucide-react";
import { useMemo, useState } from "react";
import { useIsMobile } from "@repo/ui/hooks/use-mobile";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@repo/ui/components/sheet";

interface MapFiltersProps {
    data: any; // GeoJSON
}

export default function MapFilters({ data }: MapFiltersProps) {
    const search = useSearch({ from: "/dashboard/crop-map" }) as any;
    const navigate = useNavigate();
    const isMobile = useIsMobile();
    const [open, setOpen] = useState(false);

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

    const activeFilterCount = [search.crop, search.disease, search.status].filter(Boolean).length;
    const hasFilters = activeFilterCount > 0;

    const FilterContent = ({ className = "" }: { className?: string }) => (
        <div className={`flex flex-col gap-5 ${className}`}>
            {/* Crop Filter */}
            <div className="space-y-2">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider ml-1">Crop Type</label>
                <Select
                    value={search.crop || "all"}
                    onValueChange={(val) => setFilter("crop", val)}
                >
                    <SelectTrigger className="h-11 w-full bg-background border-border/50 shadow-sm">
                        <div className="flex items-center">
                            <Crop className="h-4 w-4 mr-3 text-primary/60" />
                            <SelectValue placeholder="All Crops" />
                        </div>
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
            <div className="space-y-2">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider ml-1">Disease / Issue</label>
                <Select
                    value={search.disease || "all"}
                    onValueChange={(val) => setFilter("disease", val)}
                >
                    <SelectTrigger className="h-11 w-full bg-background border-border/50 shadow-sm">
                        <div className="flex items-center">
                            <Thermometer className="h-4 w-4 mr-3 text-red-500/60" />
                            <SelectValue placeholder="All Diseases" />
                        </div>
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
            <div className="space-y-2">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider ml-1">Severity Status</label>
                <Select
                    value={search.status || "all"}
                    onValueChange={(val) => setFilter("status", val)}
                >
                    <SelectTrigger className="h-11 w-full bg-background border-border/50 shadow-sm">
                        <div className="flex items-center">
                            <div
                                className={`h-2.5 w-2.5 rounded-full mr-3 ${search.status === "healthy"
                                    ? "bg-green-500"
                                    : search.status === "warning"
                                        ? "bg-yellow-500"
                                        : search.status === "critical"
                                            ? "bg-red-500"
                                            : "bg-muted-foreground/40"
                                    }`}
                            />
                            <SelectValue placeholder="Any Severity" />
                        </div>
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Any Severity</SelectItem>
                        <SelectItem value="healthy">Healthy Only</SelectItem>
                        <SelectItem value="warning">Warning Level</SelectItem>
                        <SelectItem value="critical">Critical Issue</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {hasFilters && (
                <Button
                    variant="outline"
                    onClick={clearFilters}
                    className="mt-2 w-full border-dashed text-muted-foreground hover:text-destructive hover:border-destructive/50"
                >
                    <X className="h-4 w-4 mr-2" />
                    Reset All Filters
                </Button>
            )}
        </div>
    );

    if (isMobile) {
        return (
            <div className="flex items-center justify-between gap-3 px-1">
                <Sheet open={open} onOpenChange={setOpen}>
                    <SheetTrigger asChild>
                        <Button
                            variant="outline"
                            className={`flex-1 h-11 justify-between px-4 rounded-xl border-border/60 ${hasFilters ? 'bg-primary/5 border-primary/20 text-primary' : 'bg-background'}`}
                        >
                            <div className="flex items-center gap-2">
                                <Filter className={`h-4 w-4 ${hasFilters ? 'text-primary' : 'text-muted-foreground'}`} />
                                <span className="font-semibold">Map Filters</span>
                                {hasFilters && (
                                    <Badge variant="default" className="ml-1 h-5 px-1.5 min-w-[20px] bg-primary text-primary-foreground border-none">
                                        {activeFilterCount}
                                    </Badge>
                                )}
                            </div>
                            <ChevronRight className="h-4 w-4 text-muted-foreground/50" />
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="bottom" className="rounded-t-[2rem] p-6 pt-2 pb-10">
                        <div className="mx-auto w-12 h-1.5 rounded-full bg-muted-foreground/20 mb-6 mt-2" />
                        <SheetHeader className="text-left mb-6">
                            <SheetTitle className="text-xl font-bold">Filters</SheetTitle>
                            <SheetDescription>
                                Narrow down the scan results displayed on the map.
                            </SheetDescription>
                        </SheetHeader>
                        <FilterContent />
                        <div className="mt-8">
                            <Button className="w-full h-12 rounded-xl text-lg font-semibold" onClick={() => setOpen(false)}>
                                Show Results
                            </Button>
                        </div>
                    </SheetContent>
                </Sheet>
            </div>
        );
    }

    return (
        <div className="flex flex-wrap items-center gap-3 p-4 bg-muted/30 rounded-xl border border-border/40 backdrop-blur-sm">
            <div className="flex items-center gap-2 mr-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-semibold whitespace-nowrap">Filters</span>
            </div>

            {/* Desktop Filters */}
            <div className="flex items-center gap-3">
                <Select
                    value={search.crop || "all"}
                    onValueChange={(val) => setFilter("crop", val)}
                >
                    <SelectTrigger className="h-9 w-[140px] bg-background border-border/50 shadow-sm">
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

                <Select
                    value={search.disease || "all"}
                    onValueChange={(val) => setFilter("disease", val)}
                >
                    <SelectTrigger className="h-9 w-[160px] bg-background border-border/50 shadow-sm">
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

                <Select
                    value={search.status || "all"}
                    onValueChange={(val) => setFilter("status", val)}
                >
                    <SelectTrigger className="h-9 w-[130px] bg-background border-border/50 shadow-sm">
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
