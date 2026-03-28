'use server'

import { prisma } from '@/server/lib/prisma'

export interface UpcomingLeaveRow {
    id: string
    employeeName: string
    leaveType: string
    dates: string
    days: number
}

function formatDate(date: Date): string {
    return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

export async function getUpcomingLeave(userId: string): Promise<UpcomingLeaveRow[]> {
    const membership = await prisma.membership.findFirst({
        where: { userId, status: 'ACTIVE' },
        select: { orgId: true },
    })
    if (!membership) return []

    const now = new Date()
    const twoWeeks = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000)

    const requests = await prisma.leaveRequest.findMany({
        where: {
            orgId: membership.orgId,
            status: 'APPROVED',
            startDate: { lte: twoWeeks },
            endDate: { gte: now },
        },
        include: {
            policy: { select: { name: true } },
        },
        orderBy: { startDate: 'asc' },
        take: 5,
    })

    const userIds = requests.map((r) => r.userId)
    const users = await prisma.authUser.findMany({
        where: { id: { in: userIds } },
        select: { id: true, name: true },
    })
    const userMap = new Map(users.map((u) => [u.id, u.name ?? 'Unknown']))

    return requests.map((r) => ({
        id: r.id,
        employeeName: userMap.get(r.userId) ?? 'Unknown',
        leaveType: r.policy.name,
        dates: r.startDate.getTime() === r.endDate.getTime()
            ? formatDate(r.startDate)
            : `${formatDate(r.startDate)} – ${formatDate(r.endDate)}`,
        days: Math.round((Number(r.hours) / 7.5) * 2) / 2,
    }))
}
