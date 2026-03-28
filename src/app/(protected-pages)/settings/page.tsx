import { auth } from '@/auth'
import { getOrgSettings } from '@/server/actions/org/getOrgSettings'
import { getUserRole } from '@/server/lib/getUserRole'
import SettingsView from './_components/SettingsView'

export default async function SettingsPage() {
    const session = await auth()
    const userId = session?.user?.id

    if (!userId) {
        return (
            <div className="p-6">
                <h1 className="text-2xl font-semibold">Settings</h1>
                <p className="mt-2 text-gray-500">You must be signed in to view settings.</p>
            </div>
        )
    }

    const role = await getUserRole(userId)

    if (!role?.isAdmin) {
        return (
            <div className="p-6">
                <h1 className="text-2xl font-semibold">Settings</h1>
                <div className="mt-4 rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm">
                    <p className="text-lg font-medium text-gray-900">
                        You don't have permission to view this page
                    </p>
                    <p className="mt-2 text-sm text-gray-500">
                        Organisation settings are only available to admins.
                        If you think this is a mistake, ask your manager.
                    </p>
                </div>
            </div>
        )
    }

    const settings = await getOrgSettings(userId)

    if (!settings) {
        return (
            <div className="p-6">
                <h1 className="text-2xl font-semibold">Settings</h1>
                <p className="mt-2 text-gray-500">Something went wrong loading settings. Please try again.</p>
            </div>
        )
    }

    return <SettingsView settings={settings} />
}
