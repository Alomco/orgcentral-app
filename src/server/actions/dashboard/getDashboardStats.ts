'use server'

import { prisma } from '@/server/lib/prisma'

export interface DashboardStats {
    firstName: string
    orgName: string
    totalStaff: number
    offToday: number
    pendingApprovals: number
    requestsThisMonth: number
}

export async function getDashboardStats(userId: string): Promise<DashboardStats | null> {
    const membership = await prisma.membership.findFirst({
        where: { userId, status: 'ACTIVE' },
        select: { orgId: true },
    })
    if (!membership) return null

    const [user, org] = await Promise.all([
        prisma.authUser.findUnique({ where: { id: userId }, select: { name: true } }),
        prisma.organization.findUnique({ where: { id: membership.orgId }, select: { name: true } }),
    ])

    const firstName = (user?.name ?? '').split(/\s+/)[0] || 'there'

    const now = new Date()
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const todayEnd = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000)
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)

    const [totalStaff, offToday, pendingApprovals, requestsThisMonth] = await Promise.all([
        prisma.membership.count({
            where: { orgId: membership.orgId, status: 'ACTIVE' },
        }),
        prisma.leaveRequest.count({
            where: {
                orgId: membership.orgId,
                status: 'APPROVED',
                startDate: { lte: todayEnd },
                endDate: { gte: todayStart },
            },
        }),
        prisma.leaveRequest.count({
            where: {
                orgId: membership.orgId,
                status: { in: ['SUBMITTED', 'PENDING_APPROVAL', 'AWAITING_MANAGER'] },
                NOT: { userId },
            },
        }),
        prisma.leaveRequest.count({
            where: {
                orgId: membership.orgId,
                createdAt: { gte: monthStart },
            },
        }),
    ])

    return {
        firstName,
        orgName: org?.name ?? 'your organisation',
        totalStaff,
        offToday,
        pendingApprovals,
        requestsThisMonth,
    }
}
