'use server'

import { prisma } from '@/server/lib/prisma'

export interface PendingSnapshotRow {
    id: string
    employeeName: string
    leaveType: string
    dates: string
    days: number
    timeAgo: string
}

function formatDate(date: Date): string {
    return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

function relativeTime(date: Date): string {
    const now = Date.now()
    const diff = now - date.getTime()
    const minutes = Math.floor(diff / 60000)
    if (minutes < 1) return 'Just now'
    if (minutes < 60) return `${minutes} min ago`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours} hour${hours !== 1 ? 's' : ''} ago`
    const days = Math.floor(hours / 24)
    if (days === 1) return 'Yesterday'
    return `${days} days ago`
}

export async function getPendingApprovalsSnapshot(userId: string): Promise<PendingSnapshotRow[]> {
    const membership = await prisma.membership.findFirst({
        where: { userId, status: 'ACTIVE' },
        select: { orgId: true },
    })
    if (!membership) return []

    const requests = await prisma.leaveRequest.findMany({
        where: {
            orgId: membership.orgId,
            status: { in: ['SUBMITTED', 'PENDING_APPROVAL', 'AWAITING_MANAGER'] },
            NOT: { userId },
        },
        include: {
            policy: { select: { name: true } },
        },
        orderBy: { submittedAt: 'desc' },
        take: 3,
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
        timeAgo: relativeTime(r.submittedAt ?? r.createdAt),
    }))
}
