import { Slider } from "@repo/ui/components/slider";
import { Button } from "@repo/ui/components/button";
import { Play, Pause, RotateCcw, Calendar } from "lucide-react";
import { useMemo, useState, useEffect, useRef } from "react";
import { format } from "date-fns";

interface MapTimeSliderProps {
    data: any; // GeoJSON
    onTimestampChange: (timestamp: number) => void;
    onAnimationEnd: (timestamp: number | undefined) => void;
    activeTimestamp?: number;
}

export default function MapTimeSlider({
    data,
    onTimestampChange,
    onAnimationEnd,
    activeTimestamp,
}: MapTimeSliderProps) {
    const [isPlaying, setIsPlaying] = useState(false);
    const [localTimestamp, setLocalTimestamp] = useState<number | null>(null);
    const playIntervalRef = useRef<any>(null);
    const loopsPerformed = useRef(0);

    // Extract date range from data
    const { minDate, maxDate, dates } = useMemo(() => {
        const features = data?.features || [];
        if (features.length === 0) {
            return { minDate: new Date(), maxDate: new Date(), dates: [] };
        }

        const allDates = features
            .map((f: any) => new Date(f.properties.date).getTime())
            .sort((a: any, b: any) => a - b);

        return {
            minDate: new Date(allDates[0]),
            maxDate: new Date(allDates[allDates.length - 1]),
            dates: allDates,
        };
    }, [data]);

    const currentTimestamp = localTimestamp ?? activeTimestamp ?? maxDate.getTime();

    const handleSliderChange = (values: number[]) => {
        const timestamp = values[0];
        setLocalTimestamp(timestamp);
        onTimestampChange(timestamp);
    };

    const togglePlay = () => {
        if (!isPlaying) {
            loopsPerformed.current = 0;
            // Clear local override when starting play to stay in sync with props
            setLocalTimestamp(null);
        } else {
            // When pausing, sync back to parent
            onAnimationEnd(currentTimestamp);
        }
        setIsPlaying(!isPlaying);
    };

    const reset = () => {
        setIsPlaying(false);
        setLocalTimestamp(null);
        onAnimationEnd(undefined);
    };

    useEffect(() => {
        if (isPlaying) {
            playIntervalRef.current = setInterval(() => {
                const currentIndex = dates.indexOf(currentTimestamp);
                let nextIndex = currentIndex + 1;

                if (nextIndex >= dates.length) {
                    nextIndex = 0; // Loop back
                    loopsPerformed.current += 1;
                    if (loopsPerformed.current >= 2) {
                        setIsPlaying(false);
                        onAnimationEnd(dates[dates.length - 1]);
                        return;
                    }
                }

                const nextTimestamp = dates[nextIndex];
                setLocalTimestamp(nextTimestamp);
                onTimestampChange(nextTimestamp);
            }, 800);
        } else {
            if (playIntervalRef.current) clearInterval(playIntervalRef.current);
        }

        return () => {
            if (playIntervalRef.current) clearInterval(playIntervalRef.current);
        };
    }, [isPlaying, dates, currentTimestamp, onAnimationEnd, onTimestampChange]);

    if (dates.length <= 1) return null;

    return (
        <div className="bg-background/95 backdrop-blur-md border border-border/40 p-4 rounded-xl shadow-lg animate-in slide-in-from-bottom-2 duration-300">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-primary" />
                    <span className="text-sm font-semibold">Time Analysis</span>
                    <span className="text-xs text-muted-foreground ml-2">
                        {format(new Date(currentTimestamp), "PPP")}
                    </span>
                </div>
                <div className="flex items-center gap-1">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={reset}
                        title="Reset to latest"
                    >
                        <RotateCcw className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        className="h-8 gap-1.5 px-3"
                        onClick={togglePlay}
                    >
                        {isPlaying ? (
                            <>
                                <Pause className="h-3.5 w-3.5 fill-current" />
                                <span className="text-xs">Pause</span>
                            </>
                        ) : (
                            <>
                                <Play className="h-3.5 w-3.5 fill-current" />
                                <span className="text-xs">Play</span>
                            </>
                        )}
                    </Button>
                </div>
            </div>

            <div className="px-2">
                <Slider
                    value={[currentTimestamp]}
                    min={minDate.getTime()}
                    max={maxDate.getTime()}
                    step={1} // Ideally would be filtered steps from 'dates' but for smooth UI simple timestamp is fine
                    onValueChange={handleSliderChange}
                    onValueCommit={() => {
                        // When slider drag ends, sync to URL
                        onAnimationEnd(currentTimestamp);
                        setLocalTimestamp(null);
                    }}
                    className="py-4"
                />
                <div className="flex justify-between mt-1">
                    <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-tighter">
                        {format(minDate, "MMM d, yy")}
                    </span>
                    <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-tighter text-right">
                        {format(maxDate, "MMM d, yy")}
                    </span>
                </div>
            </div>
        </div>
    );
}
