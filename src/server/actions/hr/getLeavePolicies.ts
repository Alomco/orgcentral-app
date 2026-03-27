'use server'

import { prisma } from '@/server/lib/prisma'

export interface LeavePolicyOption {
    id: string
    name: string
}

export async function getLeavePolicies(
    userId: string,
): Promise<LeavePolicyOption[]> {
    const membership = await prisma.membership.findFirst({
        where: { userId, status: 'ACTIVE' },
        select: { orgId: true },
    })

    if (!membership) {
        return []
    }

    const policies = await prisma.leavePolicy.findMany({
        where: {
            orgId: membership.orgId,
            activeTo: null, // only active policies
        },
        select: { id: true, name: true },
        orderBy: { name: 'asc' },
    })

    return policies
}
