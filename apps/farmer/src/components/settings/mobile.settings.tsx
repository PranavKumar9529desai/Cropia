import { SettingsRoute } from "@/routes/dashboard/settings/route"
import { Avatar } from "@repo/ui/components/avatar"
import { Separator } from "@repo/ui/components/separator"
import { Link, Outlet } from "@tanstack/react-router"
import { ChevronRight, LogOutIcon } from "lucide-react"

export const SettingsMobileLayout = ({ routes }: { routes: SettingsRoute[] }) => {
    return (
        <>
            <Outlet />
            <div>
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
                    {routes.map((route) => (
                        <Link key={route.href} to={route.href} className="border-none w-full flex gap-4 p-4 items-center border rounded-xl justify-between hover:bg-muted transition-colors">
                            <div className="flex  items-center">
                                <div className="p-2 rounded-full bg-muted/50">
                                    <route.icon className="size-5 text-foreground" />
                                </div>
                                <span className="font-medium text-lg">
                                    {route.title}
                                </span>
                            </div>
                            <ChevronRight className="size-5 text-muted-foreground" />
                        </Link>
                    ))}
                </div>

            </div>
        </>
    )
}   