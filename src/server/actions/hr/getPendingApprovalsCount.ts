'use server'

import { prisma } from '@/server/lib/prisma'

export async function getPendingApprovalsCount(
    userId: string,
): Promise<number> {
    const membership = await prisma.membership.findFirst({
        where: { userId, status: 'ACTIVE' },
        select: { orgId: true },
    })

    if (!membership) {
        return 0
    }

    return prisma.leaveRequest.count({
        where: {
            orgId: membership.orgId,
            status: { in: ['SUBMITTED', 'PENDING_APPROVAL', 'AWAITING_MANAGER'] },
            NOT: { userId },
        },
    })
}
