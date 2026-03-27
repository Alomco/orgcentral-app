import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import { prisma } from '@/server/lib/prisma'
import OnboardingWizard from './_components/OnboardingWizard'

export default async function OnboardingPage() {
    const session = await auth()
    const userId = session?.user?.id

    if (!userId) {
        redirect('/sign-in')
    }

    // If user already has an org, skip onboarding
    const membership = await prisma.membership.findFirst({
        where: { userId, status: 'ACTIVE' },
        select: { orgId: true },
    })

    if (membership) {
        redirect('/home')
    }

    // Get user's name from auth for pre-filling
    const authUser = await prisma.authUser.findUnique({
        where: { id: userId },
        select: { name: true, email: true },
    })

    const nameParts = (authUser?.name ?? '').trim().split(/\s+/)
    const defaultFirstName = nameParts[0] ?? ''
    const defaultLastName = nameParts.slice(1).join(' ')

    return (
        <OnboardingWizard
            userId={userId}
            email={authUser?.email ?? ''}
            defaultFirstName={defaultFirstName}
            defaultLastName={defaultLastName}
        />
    )
}
