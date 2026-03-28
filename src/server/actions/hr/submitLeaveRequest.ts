'use server'

import { randomUUID } from 'node:crypto'
import { prisma } from '@/server/lib/prisma'
import { countWorkingDays } from './leaveUtils'
import { sendLeaveRequestNotification } from '@/server/lib/leave-emails'

export type DurationType = 'full_day' | 'half_day' | 'hourly'
export type HalfDayPortion = 'first_half' | 'second_half'

export interface SubmitLeaveRequestInput {
    userId: string
    policyId: string
    startDate: string           // ISO date string
    endDate: string             // ISO date string
    durationType: DurationType
    halfDayPortion?: HalfDayPortion  // only when durationType is 'half_day'
    customHours?: number             // only when durationType is 'hourly'
    startTime?: string               // HH:MM — only when durationType is 'hourly'
    reason?: string
}

export interface SubmitLeaveRequestResult {
    success: boolean
    id?: string
    error?: string
}

const HOURS_PER_DAY = 7.5 // UK standard working day

function resolveHours(
    durationType: DurationType,
    workingDays: number,
    customHours?: number,
): number {
    switch (durationType) {
        case 'half_day':
            return HOURS_PER_DAY / 2
        case 'hourly':
            return Math.min(
                Math.max(customHours ?? 1, 0.5),
                workingDays * HOURS_PER_DAY,
            )
        case 'full_day':
        default:
            return workingDays * HOURS_PER_DAY
    }
}

export async function submitLeaveRequest(
    input: SubmitLeaveRequestInput,
): Promise<SubmitLeaveRequestResult> {
    const {
        userId,
        policyId,
        startDate,
        endDate,
        durationType = 'full_day',
        halfDayPortion,
        customHours,
        startTime,
        reason,
    } = input

    // Validate required fields
    if (!userId || !policyId || !startDate || !endDate) {
        return { success: false, error: 'Missing required fields.' }
    }

    const start = new Date(startDate)
    const end = new Date(endDate)

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        return { success: false, error: 'Invalid date format.' }
    }
    if (end < start) {
        return { success: false, error: 'End date cannot be before start date.' }
    }

    // Half day and hourly must be single-day
    if (durationType !== 'full_day' && start.getTime() !== end.getTime()) {
        return {
            success: false,
            error: 'Half day and hourly leave must be for a single date.',
        }
    }

    if (durationType === 'half_day' && !halfDayPortion) {
        return { success: false, error: 'Please select first half or second half.' }
    }

    if (durationType === 'hourly') {
        if (!customHours || customHours <= 0) {
            return { success: false, error: 'Please enter the number of hours.' }
        }
        if (customHours > HOURS_PER_DAY) {
            return {
                success: false,
                error: `Hours cannot exceed ${HOURS_PER_DAY} per day.`,
            }
        }
        if (!startTime) {
            return { success: false, error: 'Please select a start time.' }
        }
    }

    // Tenant scoping
    const membership = await prisma.membership.findFirst({
        where: { userId, status: 'ACTIVE' },
        select: { orgId: true },
    })
    if (!membership) {
        return { success: false, error: 'No active organisation membership found.' }
    }

    // Verify policy belongs to the same org
    const policy = await prisma.leavePolicy.findFirst({
        where: { id: policyId, orgId: membership.orgId },
        select: { id: true },
    })
    if (!policy) {
        return { success: false, error: 'Leave type not found for your organisation.' }
    }

    const workingDays = countWorkingDays(start, end)
    const hours = resolveHours(durationType, workingDays, customHours)

    // Build duration metadata as a plain JSON-serialisable object
    const metadata: Record<string, string | number | boolean> = { durationType }
    if (durationType === 'half_day' && halfDayPortion) {
        metadata.halfDayPortion = halfDayPortion
    }
    if (durationType === 'hourly') {
        if (customHours) metadata.customHours = customHours
        if (startTime) metadata.startTime = startTime
    }

    const leaveRequest = await prisma.leaveRequest.create({
        data: {
            id: randomUUID(),
            orgId: membership.orgId,
            userId,
            policyId: policy.id,
            status: 'SUBMITTED',
            startDate: start,
            endDate: end,
            hours,
            reason: reason?.trim() || null,
            submittedAt: new Date(),
            dataClassification: 'OFFICIAL',
            residencyTag: 'UK_ONLY',
            metadata: metadata as object,
        },
    })

    // Fire-and-forget: notify managers
    const org = await prisma.organization.findUnique({
        where: { id: membership.orgId },
        select: { name: true },
    })
    const employee = await prisma.authUser.findUnique({
        where: { id: userId },
        select: { name: true },
    })
    const policyName = (await prisma.leavePolicy.findUnique({
        where: { id: policy.id },
        select: { name: true },
    }))?.name ?? 'Leave'

    sendLeaveRequestNotification({
        leaveRequestId: leaveRequest.id,
        employeeName: employee?.name ?? 'A team member',
        leaveType: policyName,
        startDate: start,
        endDate: end,
        days: workingDays,
        reason: reason?.trim() || null,
        orgId: membership.orgId,
        orgName: org?.name ?? 'your organisation',
        requestingUserId: userId,
    }).catch((err) => console.error('[LEAVE-EMAIL] notification failed:', err))

    return { success: true, id: leaveRequest.id }
}
