import { redirect } from 'next/navigation'
import PostLoginLayout from '@/components/layouts/PostLoginLayout'
import { auth } from '@/auth'
import { prisma } from '@/server/lib/prisma'
import { getBrandSettings } from '@/server/lib/getBrandSettings'
import { BrandProvider } from '@/components/template/BrandContext'
import { ReactNode } from 'react'

export async function generateMetadata() {
    const session = await auth()
    const userId = session?.user?.id
    if (!userId) return { title: 'OrgCentral' }

    const brand = await getBrandSettings(userId)
    return {
        title: brand.orgName !== 'OrgCentral'
            ? `${brand.orgName} | OrgCentral`
            : 'OrgCentral',
    }
}

const Layout = async ({ children }: { children: ReactNode }) => {
    const session = await auth()
    const userId = session?.user?.id

    if (userId) {
        const membership = await prisma.membership.findFirst({
            where: { userId, status: 'ACTIVE' },
            select: { orgId: true },
        })

        if (!membership) {
            redirect('/onboarding')
        }
    }

    const brand = userId ? await getBrandSettings(userId) : null
    const palette = brand?.palette

    return (
        <div
            style={palette ? {
                '--primary': palette.primary,
                '--primary-deep': palette.primaryDeep,
                '--primary-mild': palette.primaryMild,
                '--primary-subtle': palette.primarySubtle,
            } as React.CSSProperties : undefined}
        >
            <BrandProvider value={brand ? {
                orgName: brand.orgName,
                brandColour: brand.brandColour,
                logoUrl: brand.logoUrl,
                initials: brand.initials,
            } : null}>
                <PostLoginLayout>{children}</PostLoginLayout>
            </BrandProvider>
        </div>
    )
}

export default Layout
