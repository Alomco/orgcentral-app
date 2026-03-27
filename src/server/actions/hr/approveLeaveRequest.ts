'use server'

import { prisma } from '@/server/lib/prisma'

export type ApprovalAction = 'approve' | 'decline'

export interface ApproveLeaveRequestInput {
    requestId: string
    approverId: string
    action: ApprovalAction
    note?: string
}

export interface ApproveLeaveRequestResult {
    success: boolean
    error?: string
}

const PENDING_STATUSES = ['SUBMITTED', 'PENDING_APPROVAL', 'AWAITING_MANAGER']

export async function approveLeaveRequest(
    input: ApproveLeaveRequestInput,
): Promise<ApproveLeaveRequestResult> {
    const { requestId, approverId, action, note } = input

    if (!requestId || !approverId) {
        return { success: false, error: 'Something went wrong. Please try again.' }
    }

    // Find the approver's org membership
    const approverMembership = await prisma.membership.findFirst({
        where: { userId: approverId, status: 'ACTIVE' },
        select: { orgId: true },
    })
    if (!approverMembership) {
        return { success: false, error: 'You do not have an active organisation membership.' }
    }

    // Fetch the request and validate
    const request = await prisma.leaveRequest.findUnique({
        where: { id: requestId },
        select: {
            id: true,
            orgId: true,
            userId: true,
            status: true,
            metadata: true,
        },
    })

    if (!request) {
        return { success: false, error: 'This request could not be found.' }
    }

    if (request.orgId !== approverMembership.orgId) {
        return { success: false, error: 'This request belongs to a different organisation.' }
    }

    if (!PENDING_STATUSES.includes(request.status)) {
        return {
            success: false,
            error: 'This request has already been actioned.',
        }
    }

    if (request.userId === approverId) {
        return { success: false, error: 'You cannot approve or decline your own request.' }
    }

    // Build the update
    const now = new Date()
    const existingMetadata =
        typeof request.metadata === 'object' && request.metadata !== null
            ? (request.metadata as Record<string, unknown>)
            : {}

    if (action === 'approve') {
        await prisma.leaveRequest.update({
            where: { id: requestId },
            data: {
                status: 'APPROVED',
                approverOrgId: approverMembership.orgId,
                approverUserId: approverId,
                decidedAt: now,
                metadata: {
                    ...existingMetadata,
                    decidedBy: approverId,
                    decision: 'approved',
                },
            },
        })
    } else {
        await prisma.leaveRequest.update({
            where: { id: requestId },
            data: {
                status: 'REJECTED',
                approverOrgId: approverMembership.orgId,
                approverUserId: approverId,
                decidedAt: now,
                metadata: {
                    ...existingMetadata,
                    decidedBy: approverId,
                    decision: 'declined',
                    ...(note?.trim() ? { declineNote: note.trim() } : {}),
                },
            },
        })
    }

    return { success: true }
}
