import { auth } from '@/auth'
import { getDashboardStats } from '@/server/actions/dashboard/getDashboardStats'
import { getUpcomingLeave } from '@/server/actions/dashboard/getUpcomingLeave'
import { getPendingApprovalsSnapshot } from '@/server/actions/dashboard/getPendingApprovalsSnapshot'
import DashboardView from './_components/DashboardView'

export default async function HrDashboardPage() {
    const session = await auth()
    const userId = session?.user?.id

    if (!userId) {
        return (
            <div className="p-6">
                <h1 className="text-2xl font-semibold">Dashboard</h1>
                <p className="mt-2 text-gray-500">You must be signed in to view the dashboard.</p>
            </div>
        )
    }

    const [stats, upcoming, pendingSnapshot] = await Promise.all([
        getDashboardStats(userId),
        getUpcomingLeave(userId),
        getPendingApprovalsSnapshot(userId),
    ])

    if (!stats) {
        return (
            <div className="p-6">
                <h1 className="text-2xl font-semibold">Dashboard</h1>
                <p className="mt-2 text-gray-500">Something went wrong. Please try signing out and back in.</p>
            </div>
        )
    }

    return (
        <DashboardView
            stats={stats}
            upcoming={upcoming}
            pendingSnapshot={pendingSnapshot}
            userId={userId}
        />
    )
}
