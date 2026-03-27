'use server'

import { prisma } from '@/server/lib/prisma'

/**
 * Display-ready leave request shape matching the ECME page component.
 */
export interface LeaveRequestRow {
    id: string
    type: string
    dates: string
    days: number
    status: 'Pending' | 'Approved' | 'Rejected' | 'Cancelled'
    evidence: string
    submitted: string
    approverSla: string
}

export interface LeaveRequestSummary {
    total: number
    pending: number
    approved: number
    rejected: number
    cancelled: number
}

export interface LeaveRequestsResult {
    requests: LeaveRequestRow[]
    summary: LeaveRequestSummary
}

const STATUS_MAP: Record<string, LeaveRequestRow['status']> = {
    SUBMITTED: 'Pending',
    PENDING_APPROVAL: 'Pending',
    AWAITING_MANAGER: 'Pending',
    DRAFT: 'Pending',
    APPROVED: 'Approved',
    REJECTED: 'Rejected',
    CANCELLED: 'Cancelled',
}

function formatDate(date: Date): string {
    return date.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    })
}

function hoursToWorkingDays(hours: number): number {
    // Standard UK working day = 7.5 hours; round to nearest 0.5
    if (hours <= 0) return 0
    const days = hours / 7.5
    return Math.round(days * 2) / 2
}

export async function getLeaveRequests(
    userId: string,
): Promise<LeaveRequestsResult> {
    // Find the user's first active membership to scope the query
    const membership = await prisma.membership.findFirst({
        where: { userId, status: 'ACTIVE' },
        select: { orgId: true },
    })

    if (!membership) {
        return { requests: [], summary: { total: 0, pending: 0, approved: 0, rejected: 0, cancelled: 0 } }
    }

    const leaveRequests = await prisma.leaveRequest.findMany({
        where: {
            orgId: membership.orgId,
            userId,
        },
        include: {
            policy: { select: { name: true } },
            attachments: { select: { id: true } },
        },
        orderBy: { createdAt: 'desc' },
    })

    // Look up approver names in bulk
    const approverUserIds = [
        ...new Set(
            leaveRequests
                .filter((r) => r.approverUserId)
                .map((r) => r.approverUserId as string),
        ),
    ]
    const approvers = approverUserIds.length > 0
        ? await prisma.authUser.findMany({
            where: { id: { in: approverUserIds } },
            select: { id: true, name: true },
        })
        : []
    const approverNameMap = new Map(approvers.map((a) => [a.id, a.name ?? 'Manager']))

    const summary: LeaveRequestSummary = {
        total: 0,
        pending: 0,
        approved: 0,
        rejected: 0,
        cancelled: 0,
    }

    const requests: LeaveRequestRow[] = leaveRequests.map((r) => {
        const displayStatus = STATUS_MAP[r.status] ?? 'Pending'

        summary.total += 1
        if (displayStatus === 'Pending') summary.pending += 1
        else if (displayStatus === 'Approved') summary.approved += 1
        else if (displayStatus === 'Rejected') summary.rejected += 1
        else summary.cancelled += 1

        const hasEvidence = r.attachments.length > 0
        const approverName = r.approverUserId
            ? approverNameMap.get(r.approverUserId) ?? 'Manager'
            : 'Manager review'

        let approverSla: string
        if (displayStatus === 'Approved') {
            approverSla = `${approverName} — approved`
        } else if (displayStatus === 'Rejected') {
            approverSla = `${approverName} — rejected`
        } else if (displayStatus === 'Cancelled') {
            approverSla = 'Cancelled'
        } else {
            approverSla = approverName === 'Manager review'
                ? 'Manager review'
                : `${approverName} — pending`
        }

        return {
            id: r.id,
            type: r.policy.name,
            dates: `${formatDate(r.startDate)} - ${formatDate(r.endDate)}`,
            days: hoursToWorkingDays(Number(r.hours)),
            status: displayStatus,
            evidence: hasEvidence ? `${r.attachments.length} file(s)` : '—',
            submitted: r.submittedAt ? formatDate(r.submittedAt) : formatDate(r.createdAt),
            approverSla,
        }
    })

    return { requests, summary }
}
