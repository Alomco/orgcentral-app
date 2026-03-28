import { auth } from '@/auth'
import { getTeamMembers } from '@/server/actions/team/getTeamMembers'
import { getPendingInvitations } from '@/server/actions/team/getPendingInvitations'
import TeamView from './_components/TeamView'

export default async function TeamPage() {
    const session = await auth()
    const userId = session?.user?.id

    if (!userId) {
        return (
            <div className="space-y-6 p-6">
                <h1 className="text-2xl font-semibold">Your team</h1>
                <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                    <p className="text-gray-500">You must be signed in to view your team.</p>
                </div>
            </div>
        )
    }

    let members, invitations
    try {
        ;[members, invitations] = await Promise.all([
            getTeamMembers(userId),
            getPendingInvitations(userId),
        ])
    } catch {
        return (
            <div className="space-y-6 p-6">
                <h1 className="text-2xl font-semibold">Your team</h1>
                <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                    <p className="text-gray-500">Something went wrong loading your team. Please try again.</p>
                </div>
            </div>
        )
    }

    return <TeamView members={members} invitations={invitations} userId={userId} />
}
