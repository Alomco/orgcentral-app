import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
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

        // Get the current path from headers
        const headerStore = await headers()
        const pathname = headerStore.get('x-next-pathname') ?? headerStore.get('next-url') ?? ''

        // If no org and not already on onboarding, redirect to onboarding
        if (!membership && !pathname.includes('/onboarding')) {
            redirect('/onboarding')
        }
    }

    return <PostLoginLayout>{children}</PostLoginLayout>
}

export default Layout
