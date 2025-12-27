import { SettingsDesktopLayout } from '@/components/settings/desktop.settings'
import { SettingsMobileLayout } from '@/components/settings/mobile.settings'
import { useIsMobile } from '@repo/ui/hooks/use-mobile'
import { createFileRoute } from '@tanstack/react-router'
import { LocateIcon, ScanIcon, UserIcon, LucideIcon, Bell } from 'lucide-react'

export const Route = createFileRoute('/dashboard/settings')({
  component: RouteComponent,

})

export type SettingsRoute = {
  title: string
  href: string
  icon: LucideIcon
}

const settingsRoutes: SettingsRoute[] = [
  {
    title: 'Account',
    href: '/dashboard/settings/account',
    icon: UserIcon
  },
  {
    title: 'My Location',
    href: '/dashboard/settings/location',
    icon: LocateIcon
  },
  {
    title: 'My Scan',
    href: '/dashboard/settings/scan',
    icon: ScanIcon
  },
  {
    title: 'Notifications',
    href: '/dashboard/settings/notification',
    icon: Bell
  }
]

function RouteComponent() {
  const isMobile = useIsMobile()
  return <>
    <h1 className="sm:text-4xl text-2xl font-bold font-brand">
      Settings
    </h1>
    <span className='text-muted-foreground font-brand'>Manage your account settings</span>
    {isMobile ? <SettingsMobileLayout routes={settingsRoutes} /> : <SettingsDesktopLayout routes={settingsRoutes} />}
  </>
}

