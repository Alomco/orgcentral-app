'use server'

import { prisma } from '@/server/lib/prisma'

export interface PendingInvitationRow {
    token: string
    email: string
    role: string
    sentAt: string
}

function formatDate(date: Date): string {
    return date.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    })
}

export async function getPendingInvitations(
    userId: string,
): Promise<PendingInvitationRow[]> {
    const membership = await prisma.membership.findFirst({
        where: { userId, status: 'ACTIVE' },
        select: { orgId: true },
    })
    if (!membership) return []

    const invitations = await prisma.invitation.findMany({
        where: {
            orgId: membership.orgId,
            status: 'pending',
        },
        select: {
            token: true,
            targetEmail: true,
            onboardingData: true,
            createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
    })

    return invitations.map((inv): PendingInvitationRow => {
        const data = inv.onboardingData as Record<string, string> | null
        return {
            token: inv.token,
            email: inv.targetEmail,
            role: data?.displayRole ?? 'Staff',
            sentAt: formatDate(inv.createdAt),
        }
    })
}
