import { SettingsRoute } from "@/routes/dashboard/settings/route"
import { Separator } from "@repo/ui/components/separator"
import { Badge } from "@repo/ui/components/badge"
import { Outlet, useLocation } from "@tanstack/react-router"
import { Link } from "@tanstack/react-router"
import { cn } from "@repo/ui/lib/utils"

export const SettingsDesktopLayout = ({ routes }: { routes: SettingsRoute[] }) => {
    const location = useLocation()

    return (
        <div className="h-screen ">
            <div>
                <Separator className='my-2' />
            </div>
            <div className='flex gap-8 my-8 *:rounded-2xl'>
                {routes.map((route) => {
                    const isActive = location.pathname === route.href
                    return (
                        <Link key={route.href} to={route.href}>
                            <Badge
                                variant={isActive ? "default" : "outline"}
                                className={cn(
                                    'w-40 justify-center p-2 transition-all duration-300 hover:scale-105 hover:shadow-lg cursor-pointer h-10 rounded-3xl',
                                    isActive ? 'bg-primary text-primary-foreground scale-105 shadow-md' : 'hover:bg-primary hover:text-primary-foreground'
                                )}
                            >
                                <div className="w-full text-center h-full flex items-center justify-center gap-2 py-4">
                                    <route.icon className="size-4" />
                                    <span>{route.title}</span>
                                </div>
                            </Badge>
                        </Link>
                    )
                })}
            </div>
            <Outlet />
        </div>
    )
}