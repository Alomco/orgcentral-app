import { redirect } from 'next/navigation'
import PostLoginLayout from '@/components/layouts/PostLoginLayout'
import { auth } from '@/auth'
import { prisma } from '@/server/lib/prisma'
import { ReactNode } from 'react'

const Layout = async ({ children }: { children: ReactNode }) => {
    const session = await auth()
    const userId = session?.user?.id

    if (userId) {
        // Check if user has an active org membership
        const membership = await prisma.membership.findFirst({
            where: { userId, status: 'ACTIVE' },
            select: { orgId: true },
        })

        // No org → send to onboarding (which lives outside this layout group)
        if (!membership) {
            redirect('/onboarding')
        }
    }

    return <PostLoginLayout>{children}</PostLoginLayout>
}

export default Layout
