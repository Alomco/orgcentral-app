'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import Avatar from '@/components/ui/Avatar'
import type { ProfileData } from '@/server/actions/profile/getProfileData'
import type { OrgSettings } from '@/server/actions/org/getOrgSettings'
import ProfileTab from './ProfileTab'
import SecurityTab from './SecurityTab'
import OrganisationTab from './OrganisationTab'
import BrandingTab from './BrandingTab'
import {
    TbUser,
    TbLock,
    TbBuilding,
    TbPalette,
} from 'react-icons/tb'

interface SettingsLayoutProps {
    profile: ProfileData
    orgSettings: OrgSettings | null
    isAdmin: boolean
    activeTab: string
}

const allTabs = [
    { key: 'profile', label: 'Profile', icon: TbUser, adminOnly: false },
    { key: 'security', label: 'Security', icon: TbLock, adminOnly: false },
    { key: 'organisation', label: 'Organisation', icon: TbBuilding, adminOnly: true },
    { key: 'branding', label: 'Branding', icon: TbPalette, adminOnly: true },
]

export default function SettingsLayout({
    profile,
    orgSettings,
    isAdmin,
    activeTab,
}: SettingsLayoutProps) {
    const router = useRouter()
    const searchParams = useSearchParams()

    const tabs = allTabs.filter((t) => !t.adminOnly || isAdmin)
    const current = tabs.find((t) => t.key === activeTab) ? activeTab : 'profile'

    const initials =
        (profile.firstName?.[0] ?? '') + (profile.lastName?.[0] ?? '')

    const handleTabChange = (tabKey: string) => {
        const params = new URLSearchParams(searchParams.toString())
        params.set('tab', tabKey)
        router.push(`/profile?${params.toString()}`)
    }

    return (
        <div className="flex flex-col gap-6">
            {/* Header with avatar */}
            <div className="flex items-center gap-4">
                <Avatar
                    shape="circle"
                    size={56}
                    className="bg-primary/10 text-primary text-lg font-bold"
                >
                    {initials.toUpperCase() || '?'}
                </Avatar>
                <div>
                    <h3>{profile.firstName} {profile.lastName}</h3>
                    <p className="text-sm text-gray-500">{profile.email}</p>
                </div>
            </div>

            {/* Tab navigation — styled as side nav on desktop, scrollable tabs on mobile */}
            <div className="flex flex-col lg:flex-row gap-6">
                {/* Side nav */}
                <nav className="flex lg:flex-col gap-1 lg:w-48 shrink-0 overflow-x-auto lg:overflow-visible">
                    {tabs.map((tab) => {
                        const Icon = tab.icon
                        const isActive = tab.key === current
                        return (
                            <button
                                key={tab.key}
                                onClick={() => handleTabChange(tab.key)}
                                className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition whitespace-nowrap ${
                                    isActive
                                        ? 'bg-primary/10 text-primary'
                                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                                }`}
                            >
                                <Icon className="text-lg" />
                                {tab.label}
                            </button>
                        )
                    })}
                </nav>

                {/* Tab content */}
                <div className="flex-1 min-w-0">
                    {current === 'profile' && (
                        <ProfileTab profile={profile} />
                    )}
                    {current === 'security' && <SecurityTab />}
                    {current === 'organisation' && orgSettings && (
                        <OrganisationTab settings={orgSettings} />
                    )}
                    {current === 'branding' && orgSettings && (
                        <BrandingTab settings={orgSettings} />
                    )}
                </div>
            </div>
        </div>
    )
}
