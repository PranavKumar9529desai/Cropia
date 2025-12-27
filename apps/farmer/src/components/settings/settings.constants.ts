import { LocateIcon, ScanIcon, UserIcon, LucideIcon } from 'lucide-react'

export type SettingsRoute = {
    title: string
    href: string
    icon: LucideIcon
}

export const settingsRoutes: SettingsRoute[] = [
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
    }
]
