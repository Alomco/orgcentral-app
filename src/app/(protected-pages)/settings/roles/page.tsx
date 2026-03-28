import { auth } from '@/auth'
import { getUserRole } from '@/server/lib/getUserRole'
import { getRoles } from '@/server/actions/roles/getRoles'
import RolesView from './_components/RolesView'

export default async function RolesPage() {
    const session = await auth()
    const userId = session?.user?.id

    if (!userId) {
        return (
            <div className="p-6">
                <h1 className="text-2xl font-semibold">Roles</h1>
                <p className="mt-2 text-gray-500">You must be signed in.</p>
            </div>
        )
    }

    const userRole = await getUserRole(userId)

    if (!userRole?.isAdmin) {
        return (
            <div className="p-6">
                <h1 className="text-2xl font-semibold">Roles</h1>
                <div className="mt-4 rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm">
                    <p className="text-lg font-medium text-gray-900">
                        You don't have permission to view this page
                    </p>
                    <p className="mt-2 text-sm text-gray-500">
                        Role management is only available to admins.
                    </p>
                </div>
            </div>
        )
    }

    const roles = await getRoles(userId)

    return <RolesView roles={roles} />
}
