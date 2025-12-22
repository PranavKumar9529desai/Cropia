import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@repo/ui/components/card";
import { Badge } from "@repo/ui/components/badge";
import {
    Activity,
    BarChart3,
    CheckCircle2,
    Info,
    ArrowUpRight,

} from "lucide-react";
import { ScanResultChart } from "./chart-pie-donut-text";
import { type ChartConfig } from "@repo/ui/components/chart";

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

    // Higher-level grouping for the pie chart
    const healthyCount = stats.diseaseDistribution.find(d => d.name === "Healthy")?.count || 0;
    const issuesDetectedCount = stats.totalScansAnalyzed - healthyCount;

    // Prepare chart data for high-level overview
    const chartData = [
        { status: "healthy", count: healthyCount, fill: "var(--color-healthy)" },
        { status: "issues", count: issuesDetectedCount, fill: "var(--color-issues)" },
    ];

    const chartConfig: ChartConfig = {
        count: {
            label: "Scans",
        },
        healthy: {
            label: "Healthy Scans",
            color: "var(--chart-2)",
        },
        issues: {
            label: "Issues Detected",
            color: "var(--chart-1)",
        }
    };

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

            <div className="grid gap-6 md:grid-cols-12">
                {/* Chart Section */}
                <div className="md:col-span-12 lg:col-span-8">
                    <Card className="h-full">
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Activity className="h-5 w-5 text-primary" />
                                Distribution of Health Markers
                            </CardTitle>
                            <CardDescription>Breakdown of disease detection and healthy crop signs</CardDescription>
                        </CardHeader>
                        <CardContent className="grid md:grid-cols-2 items-center gap-8">
                            <div className="flex justify-center w-full min-h-[200px]">
                                <ScanResultChart
                                    chartData={chartData}
                                    chartConfig={chartConfig}
                                />
                            </div>
                            <div className="space-y-4">
                                {chartData.map((item) => (
                                    <div key={item.status} className="space-y-2">
                                        <div className="flex items-center justify-between text-sm">
                                            <div className="flex items-center gap-2">
                                                <div
                                                    className="h-2 w-2 rounded-full"
                                                    style={{ backgroundColor: item.fill }}
                                                />
                                                <span className="font-medium text-foreground/80">
                                                    {item.status}
                                                </span>
                                            </div>
                                            <span className="text-muted-foreground font-mono">
                                                {stats.totalScansAnalyzed > 0
                                                    ? Math.round((item.count / stats.totalScansAnalyzed) * 100)
                                                    : 0}%
                                            </span>
                                        </div>
                                        <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                                            <div
                                                className="h-full rounded-full transition-all duration-1000"
                                                style={{
                                                    width: `${stats.totalScansAnalyzed > 0 ? (item.count / stats.totalScansAnalyzed) * 100 : 0}%`,
                                                    backgroundColor: item.fill
                                                }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Summary Info Grid */}
                <div className="md:col-span-12 lg:col-span-4 space-y-6">
                    <Card className="bg-primary/[0.03] border-primary/10">
                        <CardHeader className="pb-2">
                            <CardDescription className="text-primary/70 font-semibold uppercase text-[10px] tracking-wider">
                                Confidence Level
                            </CardDescription>
                            <CardTitle className="text-3xl font-bold flex items-center justify-between">
                                {(stats.avgConfidence * 100).toFixed(1)}%
                                <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                                    Trust Score
                                </Badge>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-xs text-muted-foreground">
                                Average AI confidence across all analyzed scans in this region.
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="bg-green-500/[0.03] border-green-500/10">
                        <CardHeader className="pb-2">
                            <CardDescription className="text-green-600/70 font-semibold uppercase text-[10px] tracking-wider">
                                Health Status
                            </CardDescription>
                            <CardTitle className="text-3xl font-bold flex items-center justify-between">
                                {stats.diseaseDistribution.find(d => d.name === "Healthy")?.count || 0}
                                <CheckCircle2 className="h-5 w-5 text-green-500 opacity-50" />
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-xs text-muted-foreground">
                                Number of scans confirmed as healthy and vigorous.
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="bg-orange-500/[0.03] border-orange-500/10">
                        <CardHeader className="pb-2">
                            <CardDescription className="text-orange-600/70 font-semibold uppercase text-[10px] tracking-wider">
                                Issue Diversity
                            </CardDescription>
                            <CardTitle className="text-3xl font-bold flex items-center justify-between">
                                {stats.diseaseDistribution.filter(d => d.name !== "Healthy").length}
                                <BarChart3 className="h-5 w-5 text-orange-500 opacity-50" />
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-xs text-muted-foreground">
                                Unique types of diseases or stress markers detected.
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {analysis.createdAt && (
                <div className="flex items-center justify-center gap-2 text-[11px] text-muted-foreground pt-4 opacity-60">
                    <Info className="h-3 w-3" />
                    Insights engine powered by Gemini 1.5 Flash • Generated {new Date(analysis.createdAt).toLocaleString()}
                </div>
            )}
        </div>
    );
}
