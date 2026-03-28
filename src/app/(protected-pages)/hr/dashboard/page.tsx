import { auth } from '@/auth'
import { getDashboardStats } from '@/server/actions/dashboard/getDashboardStats'
import { getUpcomingLeave } from '@/server/actions/dashboard/getUpcomingLeave'
import { getPendingApprovalsSnapshot } from '@/server/actions/dashboard/getPendingApprovalsSnapshot'
import Container from '@/components/shared/Container'
import AdaptiveCard from '@/components/shared/AdaptiveCard'
import DashboardView from './_components/DashboardView'

export default async function HrDashboardPage() {
    const session = await auth()
    const userId = session?.user?.id

    if (!userId) {
        return (
            <Container>
                <AdaptiveCard>
                    <h3>Dashboard</h3>
                    <p className="mt-2 text-gray-500">
                        You must be signed in to view the dashboard.
                    </p>
                </AdaptiveCard>
            </Container>
        )
    }

    const [stats, upcoming, pendingSnapshot] = await Promise.all([
        getDashboardStats(userId),
        getUpcomingLeave(userId),
        getPendingApprovalsSnapshot(userId),
    ])

    if (!stats) {
        return (
            <Container>
                <AdaptiveCard>
                    <h3>Dashboard</h3>
                    <p className="mt-2 text-gray-500">
                        Something went wrong. Please try signing out and back in.
                    </p>
                </AdaptiveCard>
            </Container>
        )
    }

    return (
        <Container>
            <AdaptiveCard>
                <DashboardView
                    stats={stats}
                    upcoming={upcoming}
                    pendingSnapshot={pendingSnapshot}
                    userId={userId}
                />
            </AdaptiveCard>
        </Container>
    )
}
