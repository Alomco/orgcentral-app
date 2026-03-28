import { auth } from '@/auth'
import { getUserRole } from '@/server/lib/getUserRole'
import { getRoles } from '@/server/actions/roles/getRoles'
import Container from '@/components/shared/Container'
import AdaptiveCard from '@/components/shared/AdaptiveCard'
import RolesView from './_components/RolesView'

export default async function RolesPage() {
    const session = await auth()
    const userId = session?.user?.id

    if (!userId) {
        return (
            <Container>
                <AdaptiveCard>
                    <h3>Roles</h3>
                    <p className="mt-2 text-gray-500">You must be signed in.</p>
                </AdaptiveCard>
            </Container>
        )
    }

    const userRole = await getUserRole(userId)

    if (!userRole?.isAdmin) {
        return (
            <Container>
                <AdaptiveCard bodyClass="p-8 text-center">
                    <h3>Roles</h3>
                    <p className="mt-4 text-lg font-medium heading-text">
                        You don&apos;t have permission to view this page
                    </p>
                    <p className="mt-2 text-sm text-gray-500">
                        Role management is only available to admins.
                    </p>
                </AdaptiveCard>
            </Container>
        )
    }

    const roles = await getRoles(userId)

    return (
        <Container>
            <AdaptiveCard>
                <RolesView roles={roles} />
            </AdaptiveCard>
        </Container>
    )
}
