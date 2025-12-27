import { SettingsRoute } from "@/routes/dashboard/settings/route"
import { Avatar } from "@repo/ui/components/avatar"
import { Separator } from "@repo/ui/components/separator"
import { Link, Outlet, useLocation } from "@tanstack/react-router"
import { ChevronRight, LogOutIcon } from "lucide-react"
import { cn } from "@repo/ui/lib/utils"

export const SettingsMobileLayout = ({ routes }: { routes: SettingsRoute[] }) => {
    const location = useLocation()
    return (
        <>
            <div className="md:hidden">
                <div className="flex gap-2 my-10">
                    <div className="shrink-0 size-20 border rounded-full">
                        <Avatar className="rounded-full" />
                    </div>
                    <div className="flex w-full items-center justify-between pr-4">
                        <div className="flex flex-col my-auto gap-1">
                            <span className="text-muted-foreground text-sm font-semibold">Welcome</span>
                            <span className=" font-bold">Mr/Mrs Pranav Desai</span>
                        </div>
                        <LogOutIcon className="w-5 h-5 text-destructive" />
                    </div>
                </div>
                <Separator className="my-10" />
                <div className="flex flex-col gap-4">
                    {routes.map((route) => {
                        const isActive = location.pathname === route.href
                        return (
                            <Link
                                key={route.href}
                                to={route.href}
                                className={cn(
                                    "border-none w-full flex gap-4 p-4 items-center border rounded-xl justify-between transition-colors",
                                    isActive ? "bg-muted shadow-sm" : "hover:bg-muted"
                                )}
                            >
                                <div className="flex items-center gap-4">
                                    <div className={cn(
                                        "p-2 rounded-full",
                                        isActive ? "bg-background shadow-sm" : "bg-muted/50"
                                    )}>
                                        <route.icon className="size-5 text-foreground" />
                                    </div>
                                    <span className={cn(
                                        "font-medium text-lg",
                                        isActive ? "font-bold" : ""
                                    )}>
                                        {route.title}
                                    </span>
                                </div>
                                <ChevronRight className="size-5 text-muted-foreground" />
                            </Link>
                        )
                    })}
                </div>
            </div>
            <Outlet />
        </>
    )
}   