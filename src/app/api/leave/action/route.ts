import { NextResponse } from 'next/server'
import { prisma } from '@/server/lib/prisma'
import { sendLeaveDecisionNotification } from '@/server/lib/leave-emails'

const PENDING_STATUSES = ['SUBMITTED', 'PENDING_APPROVAL', 'AWAITING_MANAGER']

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { token, action, comment } = body

        if (!token || !action) {
            return NextResponse.json(
                { success: false, error: 'Invalid request.' },
                { status: 400 },
            )
        }

        // Find the action token
        const actionToken = await prisma.leaveActionToken.findUnique({
            where: { token },
            select: {
                id: true,
                action: true,
                used: true,
                expiresAt: true,
                targetUserId: true,
                leaveRequestId: true,
            },
        })

        if (!actionToken) {
            return NextResponse.json(
                { success: false, error: 'This link is not valid.' },
                { status: 404 },
            )
        }

        if (actionToken.used) {
            return NextResponse.json(
                { success: false, error: 'This link has already been used.' },
                { status: 410 },
            )
        }

        if (actionToken.expiresAt < new Date()) {
            return NextResponse.json(
                { success: false, error: 'This link has expired. Please use the approvals dashboard.' },
                { status: 410 },
            )
        }

        // Fetch the leave request
        const leaveRequest = await prisma.leaveRequest.findUnique({
            where: { id: actionToken.leaveRequestId },
            select: {
                id: true,
                orgId: true,
                userId: true,
                status: true,
                startDate: true,
                endDate: true,
                hours: true,
                metadata: true,
                policy: { select: { name: true } },
            },
        })

        if (!leaveRequest) {
            return NextResponse.json(
                { success: false, error: 'The leave request could not be found.' },
                { status: 404 },
            )
        }

        if (!PENDING_STATUSES.includes(leaveRequest.status)) {
            return NextResponse.json(
                { success: false, error: 'This request has already been actioned.' },
                { status: 410 },
            )
        }

        // Prevent self-approval
        if (leaveRequest.userId === actionToken.targetUserId) {
            return NextResponse.json(
                { success: false, error: 'You cannot approve your own request.' },
                { status: 403 },
            )
        }

        const now = new Date()
        const isApprove = action === 'approve'
        const existing = leaveRequest.metadata as Record<string, string | number | boolean> | null
        const base = existing ?? {}

        // Update the leave request
        await prisma.leaveRequest.update({
            where: { id: leaveRequest.id },
            data: {
                status: isApprove ? 'APPROVED' : 'REJECTED',
                approverOrgId: leaveRequest.orgId,
                approverUserId: actionToken.targetUserId,
                decidedAt: now,
                metadata: {
                    ...base,
                    decidedBy: actionToken.targetUserId,
                    decision: isApprove ? 'approved' : 'declined',
                    decidedVia: 'email',
                    ...(comment ? { declineNote: comment } : {}),
                } as object,
            },
        })

        // Mark token as used
        await prisma.leaveActionToken.update({
            where: { id: actionToken.id },
            data: { used: true },
        })

        // Also mark the sibling token (the other action for the same manager) as used
        await prisma.leaveActionToken.updateMany({
            where: {
                leaveRequestId: leaveRequest.id,
                targetUserId: actionToken.targetUserId,
                used: false,
            },
            data: { used: true },
        })

        // Send decision notification to employee (fire-and-forget)
        const [employee, approver, org] = await Promise.all([
            prisma.authUser.findUnique({ where: { id: leaveRequest.userId }, select: { email: true, name: true } }),
            prisma.authUser.findUnique({ where: { id: actionToken.targetUserId }, select: { name: true } }),
            prisma.organization.findUnique({ where: { id: leaveRequest.orgId }, select: { name: true, settings: true } }),
        ])

        const orgBrandColour = (org?.settings as Record<string, string> | null)?.brandColour || undefined

        const days = Math.round((Number(leaveRequest.hours) / 7.5) * 2) / 2

        if (employee?.email) {
            sendLeaveDecisionNotification({
                employeeEmail: employee.email,
                employeeName: employee.name ?? 'there',
                approverName: approver?.name ?? 'Your manager',
                leaveType: leaveRequest.policy.name,
                startDate: leaveRequest.startDate,
                endDate: leaveRequest.endDate,
                days,
                decision: isApprove ? 'approved' : 'declined',
                comment: comment || undefined,
                orgName: org?.name ?? 'your organisation',
                brandColour: orgBrandColour,
            }).catch((err) => console.error('[LEAVE-ACTION] notification failed:', err))
        }

        console.log(`[LEAVE-ACTION] ${isApprove ? 'APPROVED' : 'DECLINED'} request ${leaveRequest.id} via email token`)

        return NextResponse.json({
            success: true,
            employeeName: employee?.name ?? 'The team member',
        })
    } catch (err: unknown) {
        console.error('[LEAVE-ACTION] FAILED:', err)
        return NextResponse.json(
            { success: false, error: 'Something went wrong. Please try again.' },
            { status: 500 },
        )
    }
}
