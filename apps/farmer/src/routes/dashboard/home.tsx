import { createFileRoute } from "@tanstack/react-router";
import { getUserWeather } from "../../utils/user-weather";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@repo/ui/components/card";
import {
  CloudRain,
  Sun,
  Wind,
  Droplets,
  AlertTriangle,
  CheckCircle,
  SprayCan,
  Sprout,
  ArrowDown,
  ArrowUp,
  Info,
} from "lucide-react";
import { cn } from "@repo/ui/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@repo/ui/components/dialog";



const WeatherSkelton = () => {
  return (
    <div className="flex w-full h-full items-center  justify-center">
      Loading...
    </div>
  );
};

export const Route = createFileRoute("/dashboard/home")({
  component: RouteComponent,
  pendingComponent: WeatherSkelton,
  loader: async () => {
    const response = await getUserWeather();
    return response;
  },
});

function RouteComponent() {
  const data = Route.useLoaderData();
  const { location, current, insights } = data;

  // Header Logic
  const isRainy = current.rain > 0;
  const WeatherIcon = isRainy ? CloudRain : Sun;
  const weatherCondition = isRainy ? "Rainy" : "Sunny/Cloudy";

  // Zone 0: Hero Insight Logic
  const getHeroInsight = () => {
    if (insights.root_health.status === "DANGER") {
      return {
        title: "Critical Root Stress",
        message: "Root zone is critically dry. Immediate irrigation required.",
        containerClass:
          "bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950/40 dark:to-red-900/20 border-red-200 dark:border-red-800",
        textClass: "text-red-900 dark:text-red-100",
        icon: AlertTriangle,
        iconColor: "text-red-600 dark:text-red-400",
      };
    }
    if (insights.water_balance.status === "CRITICAL") {
      return {
        title: "Critical Water Deficit",
        message: "Water balance is critically low. Irrigation recommended.",
        containerClass:
          "bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950/40 dark:to-orange-900/20 border-orange-200 dark:border-orange-800",
        textClass: "text-orange-900 dark:text-orange-100",
        icon: Droplets,
        iconColor: "text-orange-600 dark:text-orange-400",
      };
    }
    if (insights.spray_guide.canSprayNow) {
      return {
        title: "Safe to Spray",
        message: "Wind < 15km/h • Rain < 30%",
        containerClass:
          "bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/40 dark:to-green-900/20 border-green-200 dark:border-green-800",
        textClass: "text-green-900 dark:text-green-100",
        icon: SprayCan,
        iconColor: "text-green-600 dark:text-green-400",
      };
    }
    return {
      title: "All Systems Normal",
      message: "No critical actions required; crops are healthy.",
      containerClass:
        "bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/40 dark:to-blue-900/20 border-blue-200 dark:border-blue-800",
      textClass: "text-blue-900 dark:text-blue-100",
      icon: CheckCircle,
      iconColor: "text-blue-600 dark:text-blue-400",
    };
  };

  const hero = getHeroInsight();

  return (
    <div className=" space-y-6 max-w-3xl sm:max-w-6xl mx-auto pb-24 animate-in fade-in duration-500">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {location.village}, {location.state}
          </h1>
          <p className="text-muted-foreground">
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
        <div className="flex items-center gap-3 bg-card p-3 rounded-xl border shadow-sm w-full sm:w-auto self-start sm:self-auto">
          <WeatherIcon
            className={cn(
              "size-8 sm:size-8",
              isRainy ? "text-blue-500" : "text-yellow-500",
            )}
          />
          <div>
            <div className="text-xl font-bold">{current.temp}°C</div>
            <div className="text-xs text-muted-foreground">
              {weatherCondition}
            </div>
          </div>
        </div>
      </div>

      {/* Zone 0: Hero Insight */}
      <div className="max-w-[22rem] w-full sm:max-w-full space-y-10">
        <Card
          className={cn(
            "border-l-4 shadow-md transition-all hover:shadow-lg ",
            hero.containerClass,
          )}
        >
          <CardHeader className="flex flex-row items-start gap-4 space-y-0 pb-4">
            <hero.icon
              className={cn("h-6 w-6 mt-1 shrink-0", hero.iconColor)}
            />
            <div className="space-y-1 min-w-0 flex-1">
              <CardTitle className={cn("text-lg", hero.textClass)}>
                {hero.title}
              </CardTitle>
              <CardDescription
                className={cn(
                  "text-sm opacity-90 break-words font-medium",
                  hero.textClass,
                )}
              >
                {hero.message}
              </CardDescription>
            </div>
          </CardHeader>
        </Card>

        {/* Zone 1: Smart Spray Planner */}
        <Card className="overflow-hidden ">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wind className="h-5 w-5 text-blue-500" />
              Smart Spray Planner
            </CardTitle>
            <CardDescription>{insights.spray_guide.reason}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory">
              {insights.spray_guide.forecast.map((hour, i) => {
                const date = new Date(hour.time);
                return (
                  <div
                    key={i}
                    className={cn(
                      "flex flex-col items-center justify-center min-w-[70px] p-3 rounded-lg border text-sm transition-colors snap-center",
                      hour.isSafe
                        ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-700 dark:text-green-300"
                        : "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 opacity-80",
                    )}
                  >
                    <span className="font-semibold">{date.getHours()}:00</span>
                    <span className="text-xs mt-1 text-center font-medium">
                      {hour.isSafe ? "Safe" : "Risk"}
                    </span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Zone 2: Water Balance */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Droplets className="h-5 w-5 text-blue-500" />
                Water Balance
              </CardTitle>
              <CardDescription>
                Net water gain/loss (Past 3 days)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <div
                    className={cn(
                      "text-3xl font-bold",
                      insights.water_balance.valueMm < 0
                        ? "text-orange-600 dark:text-orange-400"
                        : "text-blue-600 dark:text-blue-400",
                    )}
                  >
                    {insights.water_balance.valueMm > 0 ? "+" : ""}
                    {insights.water_balance.valueMm} mm
                  </div>
                  <div className="text-sm font-medium text-muted-foreground">
                    {insights.water_balance.status}
                    {insights.water_balance.valueMm < 0 && (
                      <span className="block text-xs font-normal mt-0.5 opacity-80">
                        ≈{" "}
                        {(Math.abs(insights.water_balance.valueMm) / 7).toFixed(
                          1,
                        )}{" "}
                        hrs drip irrigation
                      </span>
                    )}
                  </div>
                </div>
                <div
                  className={cn(
                    "h-12 w-12 rounded-full flex items-center justify-center",
                    insights.water_balance.valueMm < 0
                      ? "bg-orange-100 dark:bg-orange-900/20"
                      : "bg-blue-100 dark:bg-blue-900/20",
                  )}
                >
                  {insights.water_balance.valueMm < 0 ? (
                    <ArrowDown
                      className={cn(
                        "h-6 w-6",
                        insights.water_balance.valueMm < 0
                          ? "text-orange-600 dark:text-orange-400"
                          : "text-blue-600 dark:text-blue-400",
                      )}
                    />
                  ) : (
                    <ArrowUp
                      className={cn(
                        "h-6 w-6",
                        insights.water_balance.valueMm < 0
                          ? "text-orange-600 dark:text-orange-400"
                          : "text-blue-600 dark:text-blue-400",
                      )}
                    />
                  )}
                </div>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg text-sm border border-border/50">
                {insights.water_balance.advice}
              </div>
            </CardContent>
          </Card>

          {/* Zone 3: Root Health X-Ray */}
          <Card className="mt-3">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-1.5">
                  <CardTitle className="flex items-center gap-2">
                    <Sprout className="h-5 w-5 text-green-600 dark:text-green-500" />
                    Root Health X-Ray
                  </CardTitle>
                  <CardDescription>Soil Moisture Profile</CardDescription>
                </div>
                <Dialog>
                  <DialogTrigger asChild>
                    <button
                      className="rounded-full p-1.5 hover:bg-muted transition-colors shrink-0"
                      aria-label="How is this calculated?"
                    >
                      <Info className="h-4 w-4 text-muted-foreground" />
                    </button>
                  </DialogTrigger>
                  <DialogContent className="max-w-sm sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle className="flex items-center gap-2">
                        <Sprout className="h-5 w-5 text-green-600 dark:text-green-500" />
                        How Root Health is Calculated
                      </DialogTitle>
                      <DialogDescription>
                        Understanding soil moisture analysis
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 text-sm">
                      <div>
                        <h4 className="font-semibold mb-2 flex items-center gap-2">
                          <span className="h-1.5 w-1.5 rounded-full bg-primary"></span>
                          Two-Layer Analysis
                        </h4>
                        <p className="text-muted-foreground leading-relaxed">
                          We monitor moisture at two critical depths to give you
                          a complete picture of root zone health:
                        </p>
                      </div>

                      <div className="space-y-3">
                        <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200/50 dark:border-amber-900/50">
                          <div className="font-medium text-amber-900 dark:text-amber-100 mb-1">
                            Surface Layer (0-10cm)
                          </div>
                          <p className="text-xs text-muted-foreground leading-relaxed">
                            Critical for seedlings and surface roots. Calculated
                            from recent rainfall, evapotranspiration, and
                            temperature data.
                          </p>
                        </div>

                        <div className="p-3 rounded-lg bg-amber-100 dark:bg-amber-900/30 border border-amber-200/50 dark:border-amber-800/50">
                          <div className="font-medium text-amber-900 dark:text-amber-100 mb-1">
                            Deep Layer (10-30cm)
                          </div>
                          <p className="text-xs text-muted-foreground leading-relaxed">
                            Where mature roots access water and nutrients.
                            Analyzed using multi-day rainfall patterns and soil
                            water retention characteristics.
                          </p>
                        </div>
                      </div>

                      <div className="p-3 rounded-lg bg-muted/50 border">
                        <h4 className="font-medium mb-1.5 text-xs">
                          Health Status
                        </h4>
                        <ul className="space-y-1.5 text-xs text-muted-foreground">
                          <li className="flex items-start gap-2">
                            <CheckCircle className="h-3 w-3 text-green-600 dark:text-green-500 mt-0.5 shrink-0" />
                            <span>
                              <strong>Optimal:</strong> Both layers above 40%
                              moisture
                            </span>
                          </li>
                          <li className="flex items-start gap-2">
                            <AlertTriangle className="h-3 w-3 text-orange-600 dark:text-orange-500 mt-0.5 shrink-0" />
                            <span>
                              <strong>Watch:</strong> One layer below 30%
                            </span>
                          </li>
                          <li className="flex items-start gap-2">
                            <AlertTriangle className="h-3 w-3 text-red-600 dark:text-red-500 mt-0.5 shrink-0" />
                            <span>
                              <strong>Critical:</strong> Deep layer below 25%
                            </span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col rounded-xl overflow-hidden border border-amber-200/50 dark:border-amber-900/50">
                {/* Surface Layer */}
                <div className="h-14 bg-amber-50 dark:bg-amber-950/30 relative w-full">
                  <div
                    className="absolute top-0 left-0 h-full bg-blue-400/60 dark:bg-blue-400/40 transition-all duration-1000 ease-out border-r border-blue-400/50"
                    style={{
                      width: `${Math.min(insights.root_health.data.surface_moisture * 100, 100)}%`,
                    }}
                  />
                  <div className="absolute inset-0 flex items-center justify-between px-4 z-10">
                    <span className="text-sm font-medium text-amber-900 dark:text-amber-100">
                      Surface (0-10cm)
                    </span>
                    <span className="text-sm font-bold text-blue-700 dark:text-blue-300">
                      {(
                        insights.root_health.data.surface_moisture * 100
                      ).toFixed(0)}
                      %
                    </span>
                  </div>
                </div>

                {/* Deep Layer */}
                <div className="h-14 bg-amber-100 dark:bg-amber-900/30 relative w-full border-t border-amber-200/50 dark:border-amber-800/50">
                  <div
                    className="absolute top-0 left-0 h-full bg-blue-600/60 dark:bg-blue-600/40 transition-all duration-1000 ease-out border-r border-blue-600/50"
                    style={{
                      width: `${Math.min(insights.root_health.data.deep_moisture * 100, 100)}%`,
                    }}
                  />
                  <div className="absolute inset-0 flex items-center justify-between px-4 z-10">
                    <span className="text-sm font-medium text-amber-900 dark:text-amber-100">
                      Deep (10-30cm)
                    </span>
                    <span className="text-sm font-bold text-blue-900 dark:text-blue-200">
                      {(insights.root_health.data.deep_moisture * 100).toFixed(
                        0,
                      )}
                      %
                    </span>
                  </div>
                </div>
              </div>

              <div
                className={cn(
                  "p-3 rounded-lg text-sm font-medium flex items-start gap-2 border",
                  insights.root_health.status === "DANGER"
                    ? "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-700 dark:text-red-300"
                    : insights.root_health.status === "SAVER"
                      ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-700 dark:text-green-300"
                      : "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300",
                )}
              >
                {insights.root_health.status === "DANGER" && (
                  <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
                )}
                {insights.root_health.status === "SAVER" && (
                  <CheckCircle className="h-4 w-4 mt-0.5 shrink-0" />
                )}
                {insights.root_health.status === "OK" && (
                  <CheckCircle className="h-4 w-4 mt-0.5 shrink-0" />
                )}
                <div>
                  <div className="font-bold mb-0.5">
                    {insights.root_health.title}
                  </div>
                  {insights.root_health.message}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
