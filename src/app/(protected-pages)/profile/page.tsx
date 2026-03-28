import { auth } from '@/auth'
import { getProfileData } from '@/server/actions/profile/getProfileData'
import { getOrgSettings } from '@/server/actions/org/getOrgSettings'
import { getUserRole } from '@/server/lib/getUserRole'
import Container from '@/components/shared/Container'
import AdaptiveCard from '@/components/shared/AdaptiveCard'
import SettingsLayout from './_components/SettingsLayout'

interface ProfilePageProps {
    searchParams: Promise<{ tab?: string }>
}

export default async function ProfilePage({ searchParams }: ProfilePageProps) {
    const session = await auth()
    const userId = session?.user?.id

    if (!userId) {
        return (
            <Container>
                <AdaptiveCard>
                    <h3>Settings</h3>
                    <p className="mt-2 text-gray-500">
                        You must be signed in to view your settings.
                    </p>
                </AdaptiveCard>
            </Container>
        )
    }

    const [profile, userRole] = await Promise.all([
        getProfileData(userId),
        getUserRole(userId),
    ])

    if (!profile) {
        return (
            <Container>
                <AdaptiveCard>
                    <h3>Settings</h3>
                    <p className="mt-2 text-gray-500">
                        Something went wrong loading your profile. Please try again.
                    </p>
                </AdaptiveCard>
            </Container>
        )
    }

    const isAdmin = userRole?.isAdmin ?? false

    // Only fetch org settings for admins — non-admins don't have permission
    let orgSettings = null
    if (isAdmin) {
        orgSettings = await getOrgSettings(userId)
    }

    const params = await searchParams
    const activeTab = params.tab ?? 'profile'

    return (
        <Container>
            <AdaptiveCard>
                <SettingsLayout
                    profile={profile}
                    orgSettings={orgSettings}
                    isAdmin={isAdmin}
                    activeTab={activeTab}
                />
            </AdaptiveCard>
        </Container>
    )
}
