import { useLocation } from '@tanstack/react-router'
import { Topbar } from '@repo/ui/components/topbar'
import { Button } from '@repo/ui/components/button'
import { Bell, Settings } from 'lucide-react'

const getTitle = (pathname: string) => {
    if (pathname.includes('/home')) return 'Home'
    if (pathname.includes('/scan')) return 'Scan'
    if (pathname.includes('/assistant')) return 'Assistant'
    return 'Cropia'
}

export function MobileTopbar() {
    const { pathname } = useLocation();
    const title = getTitle(pathname);

    return (
        <Topbar
            className="border-b bg-background/80 backdrop-blur-md"
            leftContent={
                <div className="flex items-center gap-2">
                    {(title === 'Cropia' || title === 'Home') ? (
                        <>
                            <img src="/favicon/favicon.svg" alt="Logo" className="w-8 h-8" />
                            <span className="font-brand font-bold text-2xl tracking-tight">Cropia</span>
                        </>
                    ) : (
                        <span className="font-brand font-bold text-2xl tracking-tight text-primary">{title}</span>
                    )}
                </div>
            }
            rightContent={
                <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full">
                        <Bell className="h-5 w-5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full">
                        <Settings className="h-5 w-5" />
                    </Button>
                </div>
            }
        />
    )
}
