import { createFileRoute, Link } from "@tanstack/react-router";
import { authClient } from "@/lib/auth/auth-client";
import {
  Sun, Sunset, Sunrise,
  Building2, MapPin, ArrowRight,
  Bell, Map, ScanLine
} from "lucide-react";
import { cn } from "@repo/ui/lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/card";

export const Route = createFileRoute("/dashboard/")(
  {
    component: RouteComponent,
  }
);

// Helper type for jurisdiction
type Jurisdiction = {
  state?: string;
  district?: string;
  taluka?: string;
  village?: string;
} | null;

function RouteComponent() {
  const { data: session } = authClient.useSession();
  const { data: organizations } = authClient.useListOrganizations();

  const userData = session?.user;
  const jurisdiction = session?.session?.jurisdiction as Jurisdiction;
  const activeOrgId = session?.session?.activeOrganizationId;
  const activeOrg = organizations?.find(org => org.id === activeOrgId);

  // Greeting Logic
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return { text: "Good Morning", icon: Sunrise };
    if (hour < 18) return { text: "Good Afternoon", icon: Sun };
    return { text: "Good Evening", icon: Sunset };
  };

  const greeting = getGreeting();
  const GreetingIcon = greeting.icon;

  // Format jurisdiction for display with proper labels
  const formatJurisdiction = (j: Jurisdiction) => {
    if (!j) return null;

    const parts: string[] = [];

    // If no village specified but other levels exist, show "All Villages"
    if (!j.village && (j.taluka || j.district || j.state)) {
      parts.push("All Villages");
    } else if (j.village) {
      parts.push(j.village);
    }

    if (j.taluka) parts.push(`${j.taluka} Taluka`);
    if (j.district) parts.push(`${j.district} District`);
    if (j.state) parts.push(j.state);

    return parts.length > 0 ? parts.join(" → ") : null;
  };


  const jurisdictionText = formatJurisdiction(jurisdiction);

  // Quick actions for admin dashboard
  const quickActions = [
    {
      title: "Send Alert",
      description: "Push notifications to farmers",
      icon: Bell,
      href: "/dashboard/farmer-alerts",
      gradient: "from-amber-500/10 to-amber-500/5",
      iconColor: "text-amber-600 dark:text-amber-400",
    },
    {
      title: "Crop Map",
      description: "View all farmer scan locations",
      icon: Map,
      href: "/dashboard/crop-map",
      gradient: "from-emerald-500/10 to-emerald-500/5",
      iconColor: "text-emerald-600 dark:text-emerald-400",
    },
    {
      title: "Area Scan",
      description: "AI analysis for your region",
      icon: ScanLine,
      href: "/dashboard/area-scan",
      gradient: "from-purple-500/10 to-purple-500/5",
      iconColor: "text-purple-600 dark:text-purple-400",
    },

  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-10">
      {/* Welcome Banner */}
      <div className="relative">
        {/* Abstract Background Shapes */}
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/3 w-96 h-96 bg-white/10 rounded-full blur-3xl opacity-40 pointer-events-none" />
        <div className="absolute bottom-0 left-0 translate-y-1/3 -translate-x-1/3 w-80 h-80 bg-black/10 rounded-full blur-3xl opacity-30 pointer-events-none" />

        <div className="relative p-6 sm:p-10 sm:pb-6 text-primary-foreground shadow-none">
          <div className="flex items-center gap-2.5 opacity-90 mb-4">
            <div className="p-1.5 bg-white/20 rounded-lg backdrop-blur-md">
              <GreetingIcon className="w-5 h-5 text-primary" />
            </div>
            <span className="text-sm font-semibold tracking-wide uppercase text-foreground/90">
              {greeting.text}
            </span>
          </div>

          <div className="space-y-2 mb-4 sm:mb-8">
            <h1 className="text-3xl sm:text-5xl font-bold tracking-tight font-brand text-foreground">
              Hello, {userData?.name?.split(" ")[0] || "Admin"}
            </h1>
            <p className="text-lg text-foreground/80 max-w-lg leading-relaxed font-medium">
              Your admin dashboard at a glance. What would you like to do today?
            </p>
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-xs font-medium text-foreground/80">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              month: "long",
              day: "numeric",
            })}
          </div>
        </div>
      </div>

      {/* Your Access - Clean Vertical Stack */}
      <div className="px-6 sm:px-10 space-y-3 bg-card ">
        <h2 className="text-xl font-bold tracking-tight">Your Access</h2>

        <div className="space-y-2">
          <div className="flex items-center gap-3 text-foreground">
            <Building2 className="h-5 w-5 text-indigo-600 dark:text-indigo-400 shrink-0" />
            <span className="font-semibold">{activeOrg?.name || "Not assigned"}</span>
          </div>

          <div className="flex items-center gap-3 text-foreground/80">
            <MapPin className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span className="font-medium">{jurisdictionText || "All regions"}</span>
          </div>
        </div>
      </div>


      {/* Quick Actions */}
      <div className="grid gap-5 px-6 sm:px-10 pt-10">
        <h2 className="text-xl font-bold tracking-tight">Quick Actions</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action) => (
            <Link key={action.title} to={action.href} className="group">
              <Card
                className={cn(
                  "bg-transparent border-border h-full transition-all duration-300 hover:-translate-y-1 overflow-hidden relative shadow-none"
                )}
              >
                <div
                  className={cn(
                    "absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-br",
                    action.gradient
                  )}
                />

                <CardHeader className="relative space-y-0 pb-2">
                  <div className="flex justify-between items-start">
                    <div
                      className={cn(
                        "p-3 rounded-2xl bg-muted/50 transition-colors group-hover:bg-background/80",
                        action.iconColor
                      )}
                    >
                      <action.icon className="h-6 w-6" />
                    </div>
                    <ArrowRight className="h-5 w-5 text-muted-foreground opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
                  </div>
                </CardHeader>
                <CardContent className="relative pt-4">
                  <CardTitle className="text-lg font-bold mb-1.5 group-hover:text-primary transition-colors">
                    {action.title}
                  </CardTitle>
                  <CardDescription className="font-medium line-clamp-2">
                    {action.description}
                  </CardDescription>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
