import { auth } from '@/auth'
import { getProfileData } from '@/server/actions/profile/getProfileData'
import ProfileView from './_components/ProfileView'

export default async function ProfilePage() {
    const session = await auth()
    const userId = session?.user?.id

    if (!userId) {
        return (
            <div className="p-6">
                <h1 className="text-2xl font-semibold">Your profile</h1>
                <p className="mt-2 text-gray-500">You must be signed in to view your profile.</p>
            </div>
        )
    }

    const profile = await getProfileData(userId)

    if (!profile) {
        return (
            <div className="p-6">
                <h1 className="text-2xl font-semibold">Your profile</h1>
                <p className="mt-2 text-gray-500">Something went wrong loading your profile. Please try again.</p>
            </div>
        )
    }

    return <ProfileView profile={profile} />
}
