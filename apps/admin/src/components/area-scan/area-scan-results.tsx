import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@repo/ui/components/card";
import { Badge } from "@repo/ui/components/badge";
import {
    Activity,
    BarChart3,
    CheckCircle2,
    AlertTriangle,
    Info,
    ArrowUpRight
} from "lucide-react";

interface AreaScanResultsProps {
    analysis: {
        headlines: string[];
        stats: {
            diseaseDistribution: { name: string; count: number }[];
            totalScansAnalyzed: number;
            avgConfidence: number;
        };
        createdAt?: string;
    } | null;
}

export default function AreaScanResults({ analysis }: AreaScanResultsProps) {
    if (!analysis) {
        return (
            <Card className="border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
                        <Info className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-semibold">No Analysis Data</h3>
                    <p className="text-sm text-muted-foreground max-w-xs mt-2">
                        Run an AI analysis to see insights and statistics for this jurisdiction.
                    </p>
                </CardContent>
            </Card>
        );
    }

    const { headlines, stats } = analysis;

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Headlines Section */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {headlines.map((headline, index) => (
                    <Card key={index} className="overflow-hidden border-none shadow-md bg-gradient-to-br from-card to-muted/30">
                        <CardContent className="p-6">
                            <div className="flex items-start gap-3">
                                <div className="mt-1 h-5 w-5 shrink-0 rounded-full bg-primary/10 flex items-center justify-center">
                                    <ArrowUpRight className="h-3 w-3 text-primary" />
                                </div>
                                <p className="text-[15px] font-medium leading-relaxed text-foreground/80">
                                    {headline}
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Stats Grid */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card className="bg-primary/5 border-primary/10">
                    <CardHeader className="pb-2">
                        <CardDescription className="text-primary/70 font-semibold uppercase text-[10px] tracking-wider">
                            Total Scans
                        </CardDescription>
                        <CardTitle className="text-3xl font-bold flex items-center justify-between">
                            {stats.totalScansAnalyzed}
                            <Activity className="h-5 w-5 text-primary opacity-50" />
                        </CardTitle>
                    </CardHeader>
                </Card>

                <Card className="bg-green-500/5 border-green-500/10">
                    <CardHeader className="pb-2">
                        <CardDescription className="text-green-600/70 font-semibold uppercase text-[10px] tracking-wider">
                            Avg Confidence
                        </CardDescription>
                        <CardTitle className="text-3xl font-bold flex items-center justify-between">
                            {(stats.avgConfidence * 100).toFixed(1)}%
                            <CheckCircle2 className="h-5 w-5 text-green-500 opacity-50" />
                        </CardTitle>
                    </CardHeader>
                </Card>

                <Card className="bg-orange-500/5 border-orange-500/10">
                    <CardHeader className="pb-2">
                        <CardDescription className="text-orange-600/70 font-semibold uppercase text-[10px] tracking-wider">
                            Issue Types
                        </CardDescription>
                        <CardTitle className="text-3xl font-bold flex items-center justify-between">
                            {Object.keys(stats.diseaseDistribution).length}
                            <BarChart3 className="h-5 w-5 text-orange-500 opacity-50" />
                        </CardTitle>
                    </CardHeader>
                </Card>
            </div>

            {/* Disease Distribution Details */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Distribution of Issues</CardTitle>
                    <CardDescription>Frequency of detected diseases and stress markers</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {stats.diseaseDistribution.sort((a, b) => b.count - a.count).map((item) => (
                            <div key={item.name} className="space-y-2">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="font-medium">{item.name === "Healthy" ? "No Issues Found" : item.name}</span>
                                    <span className="text-muted-foreground font-mono">{item.count} instances</span>
                                </div>
                                <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                                    <div
                                        className={`h-full rounded-full ${item.name === "Healthy" ? "bg-green-500" : "bg-primary"}`}
                                        style={{ width: `${(item.count / stats.totalScansAnalyzed) * 100}%` }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {analysis.createdAt && (
                <div className="flex items-center justify-center gap-2 text-[11px] text-muted-foreground pt-4">
                    <Info className="h-3 w-3" />
                    Last analysis generated on {new Date(analysis.createdAt).toLocaleString()}
                </div>
            )}
        </div>
    );
}
