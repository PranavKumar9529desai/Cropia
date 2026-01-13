import { createFileRoute, Link } from "@tanstack/react-router";
import { authClient } from "@/lib/auth/auth-client";
import {
  Building2,
  Users,
  ScanLine,
  MapPin,
  TrendingUp,
  Activity,
  PieChart as PieChartIcon,
  Settings,
  Calendar,
  Sparkles,
  ChevronRight,
  ExternalLink,
} from "lucide-react";
import { cn } from "@repo/ui/lib/utils";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@repo/ui/components/card";
import { Badge } from "@repo/ui/components/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@repo/ui/components/avatar";
import { Button } from "@repo/ui/components/button";
import { apiClient } from "@/lib/rpc";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  XAxis,
  YAxis,
  Cell,
  Pie,
  PieChart,
} from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@repo/ui/components/chart";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectValue,
  SelectTrigger,
} from "@repo/ui/components/select";

export const Route = createFileRoute("/dashboard/organization/my-organization")({
  validateSearch: (search: Record<string, unknown>) => {
    return {
      range: (search.range as string) || "30d",
    };
  },
  loaderDeps: ({ search: { range } }) => ({ range }),
  loader: async ({ deps: { range } }) => {
    try {
      const res = await apiClient.api.admin.organization.dashboard.$get({
        query: { range },
      });
      if (!res.ok) {
        throw new Error("Failed to fetch organization dashboard data");
      }
      return await res.json();
    } catch (error) {
      console.error("Organization Dashboard Loader Error:", error);
      return null;
    }
  },
  component: RouteComponent,
});

const chartConfig: ChartConfig = {
  scans: {
    label: "Scans",
    color: "var(--primary)",
  },
  healthy: {
    label: "Healthy",
    color: "oklch(0.627 0.194 149.214)", // Green
  },
  warning: {
    label: "Warning",
    color: "oklch(0.707 0.165 56.12)", // Amber
  },
  critical: {
    label: "Critical",
    color: "oklch(0.627 0.258 23.51)", // Red
  },
};

function RouteComponent() {
  const data = Route.useLoaderData();
  const { range } = Route.useSearch();
  const navigate = Route.useNavigate();
  const { data: session } = authClient.useSession();

  const info = data?.info;
  const stats = data?.stats;
  const charts = data?.charts;
  const latestAnalyses = data?.latestAnalyses || [];

  const jurisdiction = session?.session?.jurisdiction as any;

  const handleRangeChange = (newRange: string) => {
    navigate({ search: (prev: any) => ({ ...prev, range: newRange }) });
  };

  const formatJurisdiction = (j: any) => {
    if (!j) return "No jurisdiction set";
    const parts = [];
    if (j.village && j.village !== "All") parts.push(j.village);
    if (j.taluka && j.taluka !== "All") parts.push(j.taluka);
    if (j.district && j.district !== "All") parts.push(j.district);
    if (j.state && j.state !== "All") parts.push(j.state);
    return parts.length > 0 ? parts.join(" → ") : "All Access";
  };

  const statItems = [
    {
      label: "Total Members",
      value: stats?.totalMembers?.toString() || "0",
      icon: Users,
      color: "text-blue-500",
      bg: "bg-blue-500/10",
    },
    {
      label: "Filtered Scans",
      value: stats?.totalScans?.toLocaleString() || "0",
      icon: ScanLine,
      color: "text-emerald-500",
      bg: "bg-emerald-500/10",
    },
    {
      label: "Villages (Range)",
      value: stats?.uniqueVillages?.toString() || "0",
      icon: Building2,
      color: "text-amber-500",
      bg: "bg-amber-500/10",
    },
    {
      label: "Avg Confidence",
      value: stats?.avgConfidence ? `${stats.avgConfidence}%` : "0%",
      icon: Activity,
      color: "text-purple-500",
      bg: "bg-purple-500/10",
    },
  ];

  const latestAnalysis = latestAnalyses?.[0];

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col overflow-hidden container mx-auto">
      <style dangerouslySetInnerHTML={{
        __html: `
        .subtle-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .subtle-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .subtle-scrollbar::-webkit-scrollbar-thumb {
          background: oklch(var(--primary) / 0.1);
          border-radius: 10px;
          border: 2px solid transparent;
          background-clip: padding-box;
        }
        .subtle-scrollbar::-webkit-scrollbar-thumb:hover {
          background: oklch(var(--primary) / 0.3);
          background-clip: padding-box;
        }
      `}} />

      {/* STICKY HEADER AREA */}
      <div className="px-4 md:px-8 py-6 border-b border-border/50 sticky top-0 z-20 bg-background/95 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center md:items-end justify-between gap-6">
          <div className="flex flex-col md:flex-row items-center md:items-center gap-6 text-center md:text-left">
            <Avatar className="w-20 h-20 rounded-2xl border-2 border-primary/10 shadow-sm">
              <AvatarImage src={info?.logo || ""} alt={info?.name} />
              <AvatarFallback className="text-2xl font-brand bg-primary/5 text-primary rounded-2xl">
                {info?.name?.[0] || "O"}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-1.5">
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight font-brand text-foreground leading-none">
                {info?.name || "My Organization"}
              </h1>
              <p className="text-muted-foreground font-medium flex items-center justify-center md:justify-start gap-1.5 text-sm">
                <MapPin className="w-3.5 h-3.5" />
                {info?.metadata || "Maharashtra, India"}
              </p>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-1">
                {jurisdiction && (
                  <Badge
                    variant="secondary"
                    className="text-[10px] uppercase tracking-widest font-bold bg-muted/50 border-transparent"
                  >
                    {jurisdiction.state || "National"} Level
                  </Badge>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link to="/dashboard/settings">
              <Button variant="outline" size="sm" className="h-9 px-3 gap-2 rounded-xl text-xs font-bold">
                <Settings className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Settings</span>
              </Button>
            </Link>
            <Link to="/dashboard/organization/members">
              <Button size="sm" className="h-9 px-3 gap-2 rounded-xl text-xs font-bold bg-primary hover:bg-primary/90">
                Manage Members
                <ChevronRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* SCROLLABLE CONTENT AREA */}
      <div className="flex-1 overflow-y-auto subtle-scrollbar scroll-smooth">
        <div className="container max-w-7xl mx-auto p-4 md:p-8 space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-16">
          {/* Pulse Statistics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
            {statItems.map((stat) => (
              <Card key={stat.label} className="space-y-3 p-4">
                <div className="flex items-center gap-2.5">
                  <div className={cn("p-2 rounded-xl", stat.bg, stat.color)}>
                    <stat.icon className="w-4 h-4" />
                  </div>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.15em]">
                    {stat.label}
                  </p>
                </div>
                <h2 className="text-4xl font-bold font-brand tracking-tight">
                  {stat.value}
                </h2>
              </Card>
            ))}
          </div>

          {/* Visual Analytics */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 pt-4">
            {/* Scan Trends Area Chart */}
            <div className="lg:col-span-8 space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <h3 className="text-xl font-bold font-brand flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-primary" />
                    Activity Trend
                  </h3>
                  <p className="text-sm text-muted-foreground font-medium">
                    Daily scan throughput distribution.
                  </p>
                </div>

                <Select value={range} onValueChange={handleRangeChange}>
                  <SelectTrigger className="w-[110px] h-9 rounded-xl text-xs font-bold border-border/50 bg-muted/20">
                    <Calendar className="w-3.5 h-3.5 mr-2 text-muted-foreground" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="7d" className="text-xs">Last 7d</SelectItem>
                    <SelectItem value="30d" className="text-xs">Last 30d</SelectItem>
                    <SelectItem value="90d" className="text-xs">Last 90d</SelectItem>
                    <SelectItem value="all" className="text-xs">All Time</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="min-h-[300px] w-full mt-4">
                <ChartContainer config={chartConfig} className="h-[300px] w-full">
                  <AreaChart data={charts?.trends || []} margin={{ left: -20, right: 10 }}>
                    <defs>
                      <linearGradient id="colorScans" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis
                      dataKey="date"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "var(--muted-foreground)", fontSize: 11, fontWeight: 500 }}
                      dy={10}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "var(--muted-foreground)", fontSize: 11, fontWeight: 500 }}
                    />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Area
                      type="monotone"
                      dataKey="scans"
                      stroke="var(--primary)"
                      strokeWidth={3}
                      fillOpacity={1}
                      fill="url(#colorScans)"
                      animationDuration={1500}
                    />
                  </AreaChart>
                </ChartContainer>
              </div>
            </div>

            {/* Global Health Donut Chart */}
            <div className="lg:col-span-4 space-y-6">
              <div className="space-y-1">
                <h3 className="text-xl font-bold font-brand flex items-center gap-2">
                  <PieChartIcon className="w-5 h-5 text-primary" />
                  Health Mix
                </h3>
                <p className="text-sm text-muted-foreground font-medium">
                  Categorical distribution of crop status.
                </p>
              </div>

              <div className="flex flex-col items-center pt-4">
                <ChartContainer config={chartConfig} className="mx-auto aspect-square w-full max-w-[220px]">
                  <PieChart>
                    <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                    <Pie
                      data={(charts?.health || []).map((d: any) => ({
                        ...d,
                        fill: chartConfig[d.name.toLowerCase() as keyof typeof chartConfig]?.color || "var(--muted)"
                      }))}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={70}
                      outerRadius={100}
                      strokeWidth={8}
                      stroke="var(--background)"
                      paddingAngle={5}
                    >
                      {(charts?.health || []).map((_entry: any, index: number) => (
                        <Cell key={`cell-${index}`} />
                      ))}
                    </Pie>
                  </PieChart>
                </ChartContainer>

                <div className="grid grid-cols-1 gap-4 w-full mt-8">
                  {(charts?.health || []).map((item: any) => (
                    <div key={item.name} className="flex items-center justify-between border-b border-border/30 pb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: chartConfig[item.name.toLowerCase() as keyof typeof chartConfig]?.color }} />
                        <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                          {item.name}
                        </span>
                      </div>
                      <span className="text-lg font-bold font-brand">{item.value}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Latest Intelligence Section */}
            <div className="lg:col-span-12">
              <Card className="border border-primary/10 bg-primary/[0.02] rounded-3xl overflow-hidden shadow-none">
                <CardHeader className="border-b border-primary/5 bg-primary/[0.01] px-8 py-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <CardTitle className="text-lg font-bold font-brand flex items-center gap-2 text-primary">
                        <Sparkles className="w-5 h-5" />
                        Latest Regional Intelligence
                      </CardTitle>
                      <CardDescription className="text-xs font-medium">
                        Automated AI synthesis of scans in {formatJurisdiction(jurisdiction)}
                      </CardDescription>
                    </div>
                    {latestAnalysis ? (
                      <Link to="/dashboard/area-scan">
                        <Button variant="ghost" size="sm" className="text-xs font-bold gap-2 text-primary hover:bg-primary/5">
                          View Full Analysis
                          <ExternalLink className="w-3.5 h-3.5" />
                        </Button>
                      </Link>
                    ) : (
                      <Link to="/dashboard/area-scan">
                        <Button variant="outline" size="sm" className="text-xs font-bold gap-2">
                          Analyze Now
                          <ChevronRight className="w-3.5 h-3.5" />
                        </Button>
                      </Link>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="p-8">
                  {latestAnalysis ? (
                    <div className="grid md:grid-cols-12 gap-8 items-start">
                      <div className="md:col-span-8 space-y-6">
                        <div className="grid gap-3">
                          {latestAnalysis.headlines.slice(0, 2).map((headline: string, i: number) => (
                            <div key={i} className="flex gap-4 items-start p-4 rounded-2xl bg-background border border-border/50 group hover:border-primary/30 transition-colors">
                              <div className="mt-1 h-3 w-3 rounded-full bg-primary/20 flex-shrink-0 flex items-center justify-center">
                                <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                              </div>
                              <p className="text-sm font-medium leading-relaxed">{headline}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="md:col-span-4 space-y-4">
                        <div className="p-5 rounded-2xl border border-border/50 bg-background/50 space-y-4">
                          <div className="flex justify-between items-end border-b border-border/50 pb-3">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Processed On</span>
                            <span className="text-sm font-bold font-brand">
                              {new Date(latestAnalysis.lastProcessedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                            </span>
                          </div>
                          <div className="flex justify-between items-end border-b border-border/50 pb-3">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Scans Analyzed</span>
                            <span className="text-sm font-bold font-brand">{latestAnalysis.lastScanCount} records</span>
                          </div>
                          <div className="flex justify-between items-end">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Health Confidence</span>
                            <span className="text-sm font-bold font-brand text-primary">{(latestAnalysis.stats as any)?.avgConfidence?.toFixed(1)}%</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-8 text-center space-y-3">
                      <div className="p-3 rounded-2xl bg-muted/50 text-muted-foreground">
                        <ScanLine className="w-6 h-6" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-bold">No Analysis Reports Found</p>
                        <p className="text-xs text-muted-foreground max-w-[300px]">Run your first area scan to generate predictive intelligence for this jurisdiction.</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Regional Performance Bar Chart */}
            <div className="lg:col-span-12 space-y-6 pt-12 border-t border-border/50">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <h3 className="text-xl font-bold font-brand flex items-center gap-2">
                    <Activity className="w-5 h-5 text-primary" />
                    Jurisdiction Impact
                  </h3>
                  <p className="text-sm text-muted-foreground font-medium">Comparative scan volume by sub-regions.</p>
                </div>
              </div>

              <div className="flex justify-center mt-8">
                <div className="w-full max-w-3xl bg-muted/10 rounded-3xl p-6 border border-border/50">
                  <ChartContainer config={chartConfig} className="h-[200px] w-full">
                    <BarChart data={charts?.regions || []} margin={{ left: -20, bottom: 0 }}>
                      <XAxis
                        dataKey="name"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: "var(--muted-foreground)", fontSize: 10, fontWeight: 600 }}
                        dy={10}
                      />
                      <YAxis axisLine={false} tickLine={false} tick={{ fill: "var(--muted-foreground)", fontSize: 10 }} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar dataKey="count" fill="var(--primary)" radius={[4, 4, 0, 0]} barSize={40} animationDuration={1500} />
                    </BarChart>
                  </ChartContainer>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Info */}
          <div className="pt-20 flex flex-col items-center justify-center text-center space-y-3 opacity-50">
            <div className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
              <span>{formatJurisdiction(jurisdiction)}</span>
              <div className="w-1 h-1 rounded-full bg-border" />
              <span>Report Generated: {new Date().toLocaleDateString()}</span>
            </div>
            <p className="text-[9px] text-muted-foreground font-medium max-w-sm">
              Proprietary Intelligence Dashboard. Data subject to AI confidence thresholds and regional scan density.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
