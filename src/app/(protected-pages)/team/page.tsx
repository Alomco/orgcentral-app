import { auth } from '@/auth'
import { getTeamMembers } from '@/server/actions/team/getTeamMembers'
import { getPendingInvitations } from '@/server/actions/team/getPendingInvitations'
import { getRoles } from '@/server/actions/roles/getRoles'
import { getUserRole } from '@/server/lib/getUserRole'
import Container from '@/components/shared/Container'
import AdaptiveCard from '@/components/shared/AdaptiveCard'
import TeamView from './_components/TeamView'

export default async function TeamPage() {
    const session = await auth()
    const userId = session?.user?.id

    if (!userId) {
        return (
            <Container>
                <AdaptiveCard>
                    <h3>Your team</h3>
                    <p className="mt-2 text-gray-500">
                        You must be signed in to view your team.
                    </p>
                </AdaptiveCard>
            </Container>
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
            <Container>
                <AdaptiveCard>
                    <h3>Your team</h3>
                    <p className="mt-2 text-gray-500">
                        Something went wrong loading your team. Please try again.
                    </p>
                </AdaptiveCard>
            </Container>
        )
    }

    return (
        <Container>
            <AdaptiveCard>
                <TeamView
                    members={members}
                    invitations={invitations}
                    userId={userId}
                    roles={roles}
                    isAdmin={userRole?.isAdmin ?? false}
                />
            </AdaptiveCard>
        </Container>
    )
}
