import { randomUUID } from 'node:crypto'
import { prisma } from './prisma'
import { sendEmail } from './email'

const BASE_URL = () => process.env.NEXT_PUBLIC_APP_URL ?? 'https://orgcentral.app'

function formatDate(date: Date): string {
    return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

function emailWrapper(body: string): string {
    return `
<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 520px; margin: 0 auto;">
    <div style="background-color: #001A4E; padding: 20px 24px; border-radius: 12px 12px 0 0;">
        <strong style="color: #ffffff; font-size: 16px;">OrgCentral</strong>
    </div>
    <div style="background: #ffffff; border: 1px solid #E8EDEE; border-top: none; padding: 28px 24px; border-radius: 0 0 12px 12px;">
        ${body}
    </div>
    <div style="padding: 16px 24px; text-align: center;">
        <span style="font-size: 12px; color: #a3a3a3;">OrgCentral · Management made simple</span>
    </div>
</div>`
}

function actionButton(label: string, href: string, color: string = '#0066CC'): string {
    return `<a href="${href}" style="display: inline-block; background-color: ${color}; color: #ffffff; text-decoration: none; padding: 12px 28px; border-radius: 8px; font-size: 14px; font-weight: 600; margin: 4px;">${label}</a>`
}

// ─── EMAIL 1: New leave request → managers ───

export async function sendLeaveRequestNotification(params: {
    leaveRequestId: string
    employeeName: string
    leaveType: string
    startDate: Date
    endDate: Date
    days: number
    reason?: string | null
    orgId: string
    orgName: string
    requestingUserId: string
}): Promise<void> {
    const { leaveRequestId, employeeName, leaveType, startDate, endDate, days, reason, orgId, orgName, requestingUserId } = params

    // Find managers/admins in the org (exclude the requesting user)
    const managerMemberships = await prisma.membership.findMany({
        where: {
            orgId,
            status: 'ACTIVE',
            NOT: { userId: requestingUserId },
            role: { name: { in: ['orgAdmin', 'manager'] } },
        },
        select: { userId: true },
    })

    if (managerMemberships.length === 0) {
        console.log('[LEAVE-EMAIL] No managers found to notify')
        return
    }

    const managerUserIds = managerMemberships.map((m) => m.userId)
    const managers = await prisma.authUser.findMany({
        where: { id: { in: managerUserIds } },
        select: { id: true, email: true, name: true },
    })

    const daysLabel = `${days} day${days !== 1 ? 's' : ''}`
    const dateRange = startDate.getTime() === endDate.getTime()
        ? formatDate(startDate)
        : `${formatDate(startDate)} – ${formatDate(endDate)}`

    for (const manager of managers) {
        // Create approve + decline tokens for this manager
        const approveToken = randomUUID()
        const declineToken = randomUUID()
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)

        await prisma.leaveActionToken.createMany({
            data: [
                {
                    id: randomUUID(),
                    token: approveToken,
                    leaveRequestId,
                    targetUserId: manager.id,
                    action: 'approve',
                    expiresAt,
                },
                {
                    id: randomUUID(),
                    token: declineToken,
                    leaveRequestId,
                    targetUserId: manager.id,
                    action: 'decline',
                    expiresAt,
                },
            ],
        })

        const approveUrl = `${BASE_URL()}/leave/action/${approveToken}?action=approve`
        const declineUrl = `${BASE_URL()}/leave/action/${declineToken}?action=decline`

        const body = `
            <h2 style="font-size: 18px; color: #231F20; margin: 0 0 8px;">New time off request</h2>
            <p style="font-size: 14px; color: #525252; line-height: 1.6; margin: 0 0 20px;">
                <strong>${employeeName}</strong> has requested <strong>${daysLabel}</strong> of <strong>${leaveType.toLowerCase()}</strong>.
            </p>
            <table style="width: 100%; font-size: 14px; color: #525252; margin-bottom: 20px;">
                <tr><td style="padding: 4px 0; color: #a3a3a3;">Dates</td><td style="padding: 4px 0;">${dateRange}</td></tr>
                <tr><td style="padding: 4px 0; color: #a3a3a3;">Duration</td><td style="padding: 4px 0;">${daysLabel}</td></tr>
                ${reason ? `<tr><td style="padding: 4px 0; color: #a3a3a3;">Reason</td><td style="padding: 4px 0;">${reason}</td></tr>` : ''}
            </table>
            <div style="text-align: center; margin: 24px 0;">
                ${actionButton('Approve', approveUrl, '#0066CC')}
                ${actionButton('Decline', declineUrl, '#dc2626')}
            </div>
            <p style="font-size: 12px; color: #a3a3a3; margin-top: 16px; text-align: center;">
                You can also manage this from your <a href="${BASE_URL()}/hr/leave/approvals" style="color: #0066CC;">approvals dashboard</a>.
            </p>`

        await sendEmail({
            to: manager.email,
            subject: `${employeeName} has requested ${daysLabel} off — ${orgName}`,
            html: emailWrapper(body),
        })
    }
}

// ─── EMAIL 2/3: Decision notification → employee ───

export async function sendLeaveDecisionNotification(params: {
    employeeEmail: string
    employeeName: string
    approverName: string
    leaveType: string
    startDate: Date
    endDate: Date
    days: number
    decision: 'approved' | 'declined'
    comment?: string
    orgName: string
}): Promise<void> {
    const { employeeEmail, employeeName, approverName, leaveType, startDate, endDate, days, decision, comment, orgName } = params

    const daysLabel = `${days} day${days !== 1 ? 's' : ''}`
    const dateRange = startDate.getTime() === endDate.getTime()
        ? formatDate(startDate)
        : `${formatDate(startDate)} – ${formatDate(endDate)}`

    const isApproved = decision === 'approved'

    const heading = isApproved
        ? 'Your time off has been approved'
        : 'Your time off request was declined'

    const message = isApproved
        ? `Great news! <strong>${approverName}</strong> has approved your <strong>${daysLabel}</strong> of <strong>${leaveType.toLowerCase()}</strong>. Enjoy your time off.`
        : `<strong>${approverName}</strong> has declined your request for <strong>${daysLabel}</strong> of <strong>${leaveType.toLowerCase()}</strong>. If you have questions, please speak with your manager directly.`

    const emoji = isApproved ? '✅' : '❌'

    const body = `
        <h2 style="font-size: 18px; color: #231F20; margin: 0 0 8px;">${emoji} ${heading}</h2>
        <p style="font-size: 14px; color: #525252; line-height: 1.6; margin: 0 0 20px;">
            ${message}
        </p>
        <table style="width: 100%; font-size: 14px; color: #525252; margin-bottom: 20px;">
            <tr><td style="padding: 4px 0; color: #a3a3a3;">Dates</td><td style="padding: 4px 0;">${dateRange}</td></tr>
            <tr><td style="padding: 4px 0; color: #a3a3a3;">Duration</td><td style="padding: 4px 0;">${daysLabel}</td></tr>
            <tr><td style="padding: 4px 0; color: #a3a3a3;">Status</td><td style="padding: 4px 0; font-weight: 600; color: ${isApproved ? '#059669' : '#dc2626'};">${isApproved ? 'Approved' : 'Declined'}</td></tr>
            ${comment ? `<tr><td style="padding: 4px 0; color: #a3a3a3;">Note</td><td style="padding: 4px 0;">${comment}</td></tr>` : ''}
        </table>
        <div style="text-align: center; margin: 24px 0;">
            ${actionButton('View your time off', `${BASE_URL()}/hr/leave/requests`)}
        </div>`

    await sendEmail({
        to: employeeEmail,
        subject: isApproved
            ? `Your ${leaveType.toLowerCase()} has been approved — ${orgName}`
            : `Your ${leaveType.toLowerCase()} request was declined — ${orgName}`,
        html: emailWrapper(body),
    })
}
