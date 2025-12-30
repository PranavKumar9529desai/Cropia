import { createFileRoute, Link } from "@tanstack/react-router";
import { authClient } from "../../lib/auth/auth-client";

import { CloudRain, ScanLine, Bot, ArrowRight, Sun, Sunset, Sunrise } from "lucide-react";
import { cn } from "@repo/ui/lib/utils";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/card";

export const Route = createFileRoute("/dashboard/")({
  component: RouteComponent,
  staleTime: 1000 * 60 * 10, // 10 minutes
  gcTime: 1000 * 60 * 15, // 15 minutes
});

function RouteComponent() {
  const { data: session } = authClient.useSession();
  const userData = session?.user;

  // Greeting Logic
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return { text: "Good Morning", icon: Sunrise };
    if (hour < 18) return { text: "Good Afternoon", icon: Sun };
    return { text: "Good Evening", icon: Sunset };
  };

  const greeting = getGreeting();
  const GreetingIcon = greeting.icon;

  const quickActions = [
    {
      title: "Weather & Insights",
      description: "Detailed forecast and farm alerts",
      icon: CloudRain,
      href: "/dashboard/home",
      gradient: "from-blue-500/10 to-blue-500/5",
      iconColor: "text-blue-600 dark:text-blue-400",
      borderColor: "group-hover:border-blue-500/50"
    },
    {
      title: "New Crop Scan",
      description: "Detect diseases with AI scan",
      icon: ScanLine,
      href: "/dashboard/scan",
      gradient: "from-green-500/10 to-green-500/5",
      iconColor: "text-green-600 dark:text-green-400",
      borderColor: "group-hover:border-green-500/50"
    },
    {
      title: "AI Assistant",
      description: "Get instant farming advice",
      icon: Bot,
      href: "/dashboard/assistant",
      gradient: "from-purple-500/10 to-purple-500/5",
      iconColor: "text-purple-600 dark:text-purple-400",
      borderColor: "group-hover:border-purple-500/50"
    }
  ];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-10">
      {/* Welcome Banner */}
      <div className="relative ">
        {/* Abstract Background Shapes */}
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/3 w-96 h-96 bg-white/10 rounded-full blur-3xl opacity-40 pointer-events-none" />
        ss <div className="absolute bottom-0 left-0 translate-y-1/3 -translate-x-1/3 w-80 h-80 bg-black/10 rounded-full blur-3xl opacity-30 pointer-events-none" />

        <div className="relative p-6 sm:p-10 text-primary-foreground  shadow-none">
          <div className="flex items-center gap-2.5 opacity-90 mb-4">
            <div className="p-1.5 bg-white/20 rounded-lg backdrop-blur-md">
              <GreetingIcon className="w-5 h-5 text-primary" />
            </div>
            <span className="text-sm font-semibold tracking-wide uppercase text-foreground/90">{greeting.text}</span>
          </div>

          <div className="space-y-2 mb-8">
            <h1 className="text-3xl sm:text-5xl font-bold tracking-tight font-brand text-foreground">
              Hello, {userData?.name?.split(' ')[0] || 'Farmer'}
            </h1>
            <p className="text-lg text-foreground/80 max-w-lg leading-relaxed font-medium">
              Your farm's performance at a glance. What would you like to check today?
            </p>
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-xs font-medium text-foreground/80">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            {new Date().toLocaleDateString("en-US", { weekday: 'long', month: 'long', day: 'numeric' })}
          </div>
        </div>
      </div>

      <div className="grid gap-6">
        <div className="flex items-center justify-between ml-6 sm:ml-10">
          <h2 className="text-xl font-bold tracking-tight">Quick Actions</h2>
        </div>

        {/* Quick Actions Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 px-8">
          {quickActions.map((action) => (
            <Link key={action.title} to={action.href} className="group">
              <Card className={cn(
                "bg-transparent border-border h-full transition-all duration-300 hover:-translate-y-1 overflow-hidden relative shadow-none",

                ""
              )}>
                <div className={cn("absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-br", action.gradient)} />

                <CardHeader className="relative space-y-0 pb-2">
                  <div className="flex justify-between items-start">
                    <div className={cn(
                      "p-3 rounded-2xl bg-muted/50 transition-colors group-hover:bg-background/80",
                      action.iconColor
                    )}>
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
