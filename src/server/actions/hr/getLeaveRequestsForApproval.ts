'use server'

import { prisma } from '@/server/lib/prisma'
import { countWorkingDays } from './leaveUtils'

export interface ApprovalRequestRow {
    id: string
    employeeName: string
    leaveType: string
    dates: string
    days: number
    reason: string
    submittedAt: string
}

function formatDate(date: Date): string {
    return date.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    })
}

function hoursToWorkingDays(hours: number): number {
    if (hours <= 0) return 0
    const days = hours / 7.5
    return Math.round(days * 2) / 2
}

export async function getLeaveRequestsForApproval(
    userId: string,
): Promise<ApprovalRequestRow[]> {
    const membership = await prisma.membership.findFirst({
        where: { userId, status: 'ACTIVE' },
        select: { orgId: true },
    })

    if (!membership) {
        return []
    }

    const requests = await prisma.leaveRequest.findMany({
        where: {
            orgId: membership.orgId,
            status: { in: ['SUBMITTED', 'PENDING_APPROVAL', 'AWAITING_MANAGER'] },
            // Exclude the approver's own requests
            NOT: { userId },
        },
        include: {
            policy: { select: { name: true } },
        },
        orderBy: { submittedAt: 'asc' },
    })

    // Look up employee names in bulk
    const employeeUserIds = [...new Set(requests.map((r) => r.userId))]
    const employees = employeeUserIds.length > 0
        ? await prisma.authUser.findMany({
            where: { id: { in: employeeUserIds } },
            select: { id: true, name: true, email: true },
        })
        : []
    const employeeMap = new Map(
        employees.map((e) => [e.id, e.name ?? e.email.split('@')[0]]),
    )

    return requests.map((r) => ({
        id: r.id,
        employeeName: employeeMap.get(r.userId) ?? 'Unknown',
        leaveType: r.policy.name,
        dates: `${formatDate(r.startDate)} - ${formatDate(r.endDate)}`,
        days: hoursToWorkingDays(Number(r.hours)),
        reason: r.reason ?? '',
        submittedAt: r.submittedAt
            ? formatDate(r.submittedAt)
            : formatDate(r.createdAt),
    }))
}
