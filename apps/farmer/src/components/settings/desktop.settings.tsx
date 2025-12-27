import { SettingsRoute } from "@/routes/dashboard/settings/route"
import { Separator } from "@repo/ui/components/separator"
import { Badge } from "@repo/ui/components/badge"
import { Outlet } from "@tanstack/react-router"
import { Link } from "@tanstack/react-router"

export const SettingsDesktopLayout = ({ routes }: { routes: SettingsRoute[] }) => {
    return (
        <div>
            <div>

                <Separator className='my-2' />
            </div>
            <div className='flex gap-8 my-8 *:rounded-2xl'>
                {routes.map((route) => (
                    <Badge key={route.href} variant="outline" className='w-40 justify-center p-2 transition-all duration-300 hover:scale-105 hover:bg-primary hover:text-primary-foreground hover:shadow-lg cursor-pointer h-10 rounded-3xl'>
                        <Link to={route.href} className="w-full text-center h-full flex items-center justify-center gap-2 py-4">
                            <route.icon className="size-4" />
                            <span>{route.title}</span>
                        </Link>
                    </Badge>
                ))}
            </div>
            <Outlet />
        </div>
    )
}