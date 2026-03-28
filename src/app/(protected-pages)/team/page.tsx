import { auth } from '@/auth'
import { getTeamMembers } from '@/server/actions/team/getTeamMembers'
import { getPendingInvitations } from '@/server/actions/team/getPendingInvitations'
import { getRoles } from '@/server/actions/roles/getRoles'
import { getUserRole } from '@/server/lib/getUserRole'
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

    let members, invitations, roles, userRole
    try {
        ;[members, invitations, roles, userRole] = await Promise.all([
            getTeamMembers(userId),
            getPendingInvitations(userId),
            getRoles(userId),
            getUserRole(userId),
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

    return (
        <TeamView
            members={members}
            invitations={invitations}
            userId={userId}
            roles={roles}
            isAdmin={userRole?.isAdmin ?? false}
        />
    )
}
