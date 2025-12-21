// Header component for crop map statistics
import {
    Activity,
    CheckCircle2,
    AlertTriangle,
    AlertCircle
} from "lucide-react";

interface CropScanData {
    type: "FeatureCollection";
    features: {
        type: "Feature";
        properties: {
            id: string;
            crop: string;
            disease: string;
            status: "healthy" | "warning" | "critical";
            thumbnail: string;
            date: string;
            locationText?: string;
        };
        geometry: {
            type: "Point";
            coordinates: number[];
        };
    }[];
}

export const CropMapHeader = ({ data }: { data: CropScanData | null }) => {
    if (!data) return null;

    const stats = data.features.reduce(
        (acc, feature) => {
            acc.total++;
            if (feature.properties.status === "healthy") acc.healthy++;
            else if (feature.properties.status === "warning") acc.warning++;
            else if (feature.properties.status === "critical") acc.critical++;
            return acc;
        },
        { total: 0, healthy: 0, warning: 0, critical: 0 }
    );

    return (
        <div className="flex  items-center gap-x-8 gap-y-2 py-2 border-b border-t border-slate-100/50">
            <div className="flex items-center gap-2">
                <Activity size={16} className="text-slate-400" />
                <span className="text-sm font-medium text-slate-500">Total Scans:</span>
                <span className="text-sm font-bold text-slate-900">{stats.total}</span>
            </div>

            <div className="h-4 w-px bg-slate-200 hidden sm:block" />

            <div className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-emerald-500" />
                <span className="text-sm font-medium text-slate-500">Healthy:</span>
                <span className="text-sm font-bold text-slate-900">{stats.healthy}</span>
                <span className="text-[10px] font-semibold text-slate-400">
                    ({stats.total > 0 ? Math.round((stats.healthy / stats.total) * 100) : 0}%)
                </span>
            </div>

            <div className="flex items-center gap-2">
                <AlertTriangle size={16} className="text-amber-500" />
                <span className="text-sm font-medium text-slate-500">Warnings:</span>
                <span className="text-sm font-bold text-slate-900">{stats.warning}</span>
                <span className="text-[10px] font-semibold text-slate-400">
                    ({stats.total > 0 ? Math.round((stats.warning / stats.total) * 100) : 0}%)
                </span>
            </div>

            <div className="flex items-center gap-2">
                <AlertCircle size={16} className="text-rose-500" />
                <span className="text-sm font-medium text-slate-500">Critical:</span>
                <span className="text-sm font-bold text-slate-900">{stats.critical}</span>
                <span className="text-[10px] font-semibold text-slate-400">
                    ({stats.total > 0 ? Math.round((stats.critical / stats.total) * 100) : 0}%)
                </span>
            </div>
        </div>
    );
};