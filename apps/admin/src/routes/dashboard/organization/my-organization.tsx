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
  ArrowRight,
  Settings,
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

export const Route = createFileRoute("/dashboard/organization/my-organization")({
  loader: async () => {
    try {
      const res = await apiClient.api.admin.organization.dashboard.$get();
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
    color: "var(--primary)",
  },
  warning: {
    label: "Warning",
    color: "oklch(0.707 0.165 56.12)",
  },
  critical: {
    label: "Critical",
    color: "var(--destructive)",
  },
};

function RouteComponent() {
  const data = Route.useLoaderData();
  const { data: session } = authClient.useSession();

  const info = data?.info;
  const stats = data?.stats;
  const charts = data?.charts;

  const jurisdiction = session?.session?.jurisdiction as any;

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
      label: "Total Scans",
      value: stats?.totalScans?.toLocaleString() || "0",
      icon: ScanLine,
      color: "text-emerald-500",
      bg: "bg-emerald-500/10",
    },
    {
      label: "Reach (Villages)",
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

  return (
    <div className="container max-w-7xl mx-auto p-4 md:p-8 space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-16">
      {/* Header / Identity Section */}
      <div className="flex flex-col md:flex-row items-center md:items-end justify-between gap-6 pb-6 border-b border-border/50">
        <div className="flex flex-col md:flex-row items-center md:items-center gap-6 text-center md:text-left">
          <Avatar className="w-20 h-20 rounded-2xl border-2 border-primary/10 shadow-sm">
            <AvatarImage src={info?.logo || ""} alt={info?.name} />
            <AvatarFallback className="text-2xl font-brand bg-primary/5 text-primary rounded-2xl">
              {info?.name?.[0] || "O"}
            </AvatarFallback>
          </Avatar>
          <div className="space-y-1.5">

            <h1 className="text-3xl md:text-4xl font-bold tracking-tight font-brand text-foreground leading-none">
              {info?.name || "My Organization"}
            </h1>
            <p className="text-muted-foreground font-medium flex items-center justify-center md:justify-start gap-1.5 text-sm">
              <MapPin className="w-3.5 h-3.5" />
              {info?.metadata || "Maharashtra, India"}
            </p>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-1">

              {jurisdiction && (
                <Badge variant="secondary" className="text-[10px] uppercase tracking-widest font-bold bg-muted/50 border-transparent">
                  {jurisdiction.state || "National"} Level
                </Badge>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link to="/dashboard/settings">
            <Button variant="outline" size="sm" className="gap-2 rounded-xl">
              <Settings className="w-4 h-4" />
              Settings
            </Button>
          </Link>
          <Link to="/dashboard/organization/members">
            <Button size="sm" className="gap-2 rounded-xl bg-primary hover:bg-primary/90">
              Manage Members
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </div>

      {/* Pulse Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
        {statItems.map((stat) => (
          <div key={stat.label} className="space-y-3">
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
          </div>
        ))}
      </div>

      {/* Visual Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 pt-8">
        {/* Scan Trends Area Chart */}
        <div className="lg:col-span-8 space-y-6">
          <div className="space-y-1">
            <h3 className="text-xl font-bold font-brand flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              Scan Activity Trends
            </h3>
            <p className="text-sm text-muted-foreground font-medium">
              Monitoring daily throughput across all active jurisdictions.
            </p>
          </div>

          <div className="min-h-[300px] w-full mt-4">
            <ChartContainer config={chartConfig} className="h-[300px] w-full">
              <AreaChart data={charts?.trends || []} margin={{ left: -20, right: 10 }}>
                <defs>
                  <linearGradient id="colorScans" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor="var(--primary)"
                      stopOpacity={0.2}
                    />
                    <stop
                      offset="95%"
                      stopColor="var(--primary)"
                      stopOpacity={0}
                    />
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
              Aggregate Health
            </h3>
            <p className="text-sm text-muted-foreground font-medium">
              Current crop vigor distribution.
            </p>
          </div>

          <div className="flex flex-col items-center pt-4">
            <ChartContainer
              config={chartConfig}
              className="mx-auto aspect-square w-full max-w-[220px]"
            >
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

        {/* Admin Activity Bar Chart */}
        <div className="lg:col-span-12 space-y-6 pt-8 border-t border-border/50">
          <div className="space-y-1">
            <h3 className="text-xl font-bold font-brand flex items-center gap-2">
              <Activity className="w-5 h-5 text-primary" />
              Regional Performance
            </h3>
            <p className="text-sm text-muted-foreground font-medium">
              Comparative scan volume by sub-district / district levels.
            </p>
          </div>

          <div className="min-h-[200px] w-full mt-4">
            <ChartContainer config={chartConfig} className="h-[200px] w-full">
              <BarChart data={charts?.regions || []} margin={{ left: -20, bottom: 20 }}>
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "var(--muted-foreground)", fontSize: 11, fontWeight: 500 }}
                  dy={10}
                />
                <YAxis hide />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar
                  dataKey="count"
                  fill="var(--primary)"
                  radius={[6, 6, 0, 0]}
                  barSize={48}
                  animationDuration={1500}
                />
              </BarChart>
            </ChartContainer>
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="pt-10 flex flex-col items-center justify-center text-center space-y-2 opacity-50">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
          Organization Jurisdiction: {formatJurisdiction(jurisdiction)}
        </p>
        <p className="text-[9px] text-muted-foreground font-medium">
          Access level restricted to authorized personnel. Data updated real-time.
        </p>
      </div>
    </div>
  );
}
