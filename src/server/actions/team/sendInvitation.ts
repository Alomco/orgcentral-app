'use server'

import { randomUUID } from 'node:crypto'
import { prisma } from '@/server/lib/prisma'
import { sendEmail } from '@/server/lib/email'

export interface SendInvitationInput {
    inviterUserId: string
    email: string
    name?: string
    role: 'Staff' | 'Manager'
}

export interface SendInvitationResult {
    success: boolean
    error?: string
}

const ROLE_MAP: Record<string, string> = {
    Staff: 'member',
    Manager: 'orgAdmin',
}

export async function sendInvitation(
    input: SendInvitationInput,
): Promise<SendInvitationResult> {
    const { inviterUserId, email, name, role } = input

    if (!email?.trim()) {
        return { success: false, error: 'Please enter an email address.' }
    }

    const normalizedEmail = email.trim().toLowerCase()

    // Find inviter's org
    const inviterMembership = await prisma.membership.findFirst({
        where: { userId: inviterUserId, status: 'ACTIVE' },
        select: { orgId: true },
    })
    if (!inviterMembership) {
        return { success: false, error: 'You need to be part of an organisation to invite people.' }
    }

    const orgId = inviterMembership.orgId

    // Get org name and inviter name
    const [org, inviter] = await Promise.all([
        prisma.organization.findUnique({
            where: { id: orgId },
            select: { name: true },
        }),
        prisma.authUser.findUnique({
            where: { id: inviterUserId },
            select: { name: true },
        }),
    ])

    const orgName = org?.name ?? 'your organisation'
    const inviterName = inviter?.name ?? 'A colleague'

    // Check if already a member
    const existingUser = await prisma.authUser.findUnique({
        where: { email: normalizedEmail },
        select: { id: true },
    })
    if (existingUser) {
        const existingMembership = await prisma.membership.findFirst({
            where: { userId: existingUser.id, orgId, status: 'ACTIVE' },
            select: { userId: true },
        })
        if (existingMembership) {
            return { success: false, error: 'This person is already a member of your team.' }
        }
    }

    // Check for pending invitation
    const existingInvite = await prisma.invitation.findFirst({
        where: { targetEmail: normalizedEmail, orgId, status: 'pending' },
        select: { token: true },
    })
    if (existingInvite) {
        return { success: false, error: 'An invitation has already been sent to this email.' }
    }

    // Create invitation
    const token = randomUUID()
    const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000) // 48 hours

    await prisma.invitation.create({
        data: {
            token,
            orgId,
            organizationName: orgName,
            targetEmail: normalizedEmail,
            status: 'pending',
            invitedByUserId: inviterUserId,
            tokenKid: 'v1',
            onboardingData: {
                name: name?.trim() ?? null,
                role: ROLE_MAP[role] ?? 'member',
                displayRole: role,
            },
            expiresAt,
        },
    })

    // Send email
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://orgcentral.app'
    const inviteLink = `${baseUrl}/invite/${token}`

    console.log(`[INVITE] Link for ${normalizedEmail}: ${inviteLink}`)

    const emailResult = await sendEmail({
        to: normalizedEmail,
        subject: `You've been invited to join ${orgName} on OrgCentral`,
        html: `
            <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 20px;">
                <div style="margin-bottom: 32px;">
                    <strong style="color: #0066CC; font-size: 18px;">OrgCentral</strong>
                </div>
                <h1 style="font-size: 22px; color: #231F20; margin: 0 0 16px;">
                    You've been invited to join ${orgName}
                </h1>
                <p style="font-size: 15px; color: #525252; line-height: 1.6; margin: 0 0 8px;">
                    ${inviterName} has invited you to join <strong>${orgName}</strong> on OrgCentral — a simple platform for managing HR, time off, and team operations.
                </p>
                <p style="font-size: 15px; color: #525252; line-height: 1.6; margin: 0 0 32px;">
                    Click the button below to create your account and get started.
                </p>
                <a href="${inviteLink}" style="display: inline-block; background-color: #0066CC; color: #ffffff; text-decoration: none; padding: 12px 32px; border-radius: 8px; font-size: 15px; font-weight: 600;">
                    Accept invitation
                </a>
                <p style="font-size: 13px; color: #a3a3a3; margin-top: 32px; line-height: 1.5;">
                    This invitation expires in 48 hours. If you didn't expect this email, you can safely ignore it.
                </p>
            </div>
        `,
    })

    if (!emailResult.success) {
        return { success: false, error: emailResult.error }
    }

    return { success: true }
}
