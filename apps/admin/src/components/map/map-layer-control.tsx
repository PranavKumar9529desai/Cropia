import { Button } from "@repo/ui/components/button";
import { Layers, Map as MapIcon, Satellite, Share2 } from "lucide-react";
import { useSearch, useNavigate } from "@tanstack/react-router";

export default function MapLayerControl() {
    const search = useSearch({ from: "/dashboard/crop-map" }) as any;
    const navigate = useNavigate();

    const toggleHeatmap = () => {
        navigate({
            search: (prev: any) => ({
                ...prev,
                view: prev.view === "heatmap" ? "points" : "heatmap",
            }),
        });
    };

    const toggleConnections = () => {
        navigate({
            search: (prev: any) => ({
                ...prev,
                connections: prev.connections === "on" ? "off" : "on",
            }),
        });
    };

    const setStyle = (style: string) => {
        navigate({
            search: (prev: any) => ({
                ...prev,
                style: style,
            }),
        });
    };

    const isHeatmap = search.view === "heatmap";

    return (
        <div className="flex flex-col gap-2 bg-background/80 backdrop-blur-md p-2 rounded-xl border shadow-sm">
            <Button
                variant={isHeatmap ? "default" : "ghost"}
                size="icon"
                className="h-10 w-10 rounded-lg"
                onClick={toggleHeatmap}
                title={isHeatmap ? "Switch to Points" : "Switch to Heatmap"}
            >
                <Layers className={`h-5 w-5 ${isHeatmap ? "animate-pulse" : ""}`} />
            </Button>

            <Button
                variant={search.connections === "on" ? "default" : "ghost"}
                size="icon"
                className="h-10 w-10 rounded-lg"
                onClick={toggleConnections}
                title={search.connections === "on" ? "Hide Connections" : "Show Connections"}
            >
                <Share2 className="h-5 w-5" />
            </Button>

            <div className="h-px bg-border/50 mx-2" />

            <Button
                variant={search.style === "satellite" || !search.style ? "secondary" : "ghost"}
                size="icon"
                className="h-10 w-10 rounded-lg"
                onClick={() => setStyle("satellite")}
                title="Satellite View"
            >
                <Satellite className="h-5 w-5" />
            </Button>

            <Button
                variant={search.style === "streets" ? "secondary" : "ghost"}
                size="icon"
                className="h-10 w-10 rounded-lg"
                onClick={() => setStyle("streets")}
                title="Map View"
            >
                <MapIcon className="h-5 w-5" />
            </Button>
        </div>
    );
}
