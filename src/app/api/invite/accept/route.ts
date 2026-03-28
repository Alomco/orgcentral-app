import { NextResponse } from 'next/server'
import { randomUUID } from 'node:crypto'
import { hashPassword } from 'better-auth/crypto'
import { prisma } from '@/server/lib/prisma'

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { token, firstName, lastName, password } = body

        if (!token || !firstName?.trim() || !lastName?.trim() || !password) {
            return NextResponse.json(
                { success: false, error: 'Please fill in all fields.' },
                { status: 400 },
            )
        }

        if (password.length < 8) {
            return NextResponse.json(
                { success: false, error: 'Password must be at least 8 characters.' },
                { status: 400 },
            )
        }

        // Find the invitation
        const invitation = await prisma.invitation.findUnique({
            where: { token },
            select: {
                token: true,
                orgId: true,
                organizationName: true,
                targetEmail: true,
                status: true,
                expiresAt: true,
                onboardingData: true,
            },
        })

        if (!invitation) {
            return NextResponse.json(
                { success: false, error: 'This invitation link is not valid.' },
                { status: 404 },
            )
        }

        if (invitation.status !== 'pending') {
            return NextResponse.json(
                { success: false, error: 'This invitation has already been used.' },
                { status: 410 },
            )
        }

        if (invitation.expiresAt && invitation.expiresAt < new Date()) {
            // Mark as expired
            await prisma.invitation.update({
                where: { token },
                data: { status: 'expired' },
            })
            return NextResponse.json(
                { success: false, error: 'This invitation has expired. Ask your manager to send a new one.' },
                { status: 410 },
            )
        }

        const email = invitation.targetEmail
        const data = invitation.onboardingData as Record<string, string> | null
        const roleName = data?.role ?? 'member'

        console.log('[api/invite/accept] accepting invitation for', email)

        // Check if user already exists
        const existingUser = await prisma.authUser.findUnique({
            where: { email },
            select: { id: true },
        })
        if (existingUser) {
            return NextResponse.json(
                { success: false, error: 'An account with this email already exists. Try signing in instead.' },
                { status: 409 },
            )
        }

        const userId = randomUUID()
        const passwordHash = await hashPassword(password)
        const now = new Date()
        const displayName = `${firstName.trim()} ${lastName.trim()}`

        await prisma.$transaction(async (tx) => {
            // 1. Create authUser
            console.log('[api/invite/accept] step 1: authUser')
            await tx.authUser.create({
                data: {
                    id: userId,
                    email,
                    name: displayName,
                    emailVerified: true,
                },
            })

            // 2. Create authAccount with password
            console.log('[api/invite/accept] step 2: authAccount')
            await tx.authAccount.create({
                data: {
                    id: randomUUID(),
                    userId,
                    accountId: userId,
                    providerId: 'credential',
                    password: passwordHash,
                },
            })

            // 3. Create platform User
            console.log('[api/invite/accept] step 3: platform User')
            await tx.user.create({
                data: {
                    id: userId,
                    email,
                    displayName,
                    status: 'ACTIVE',
                    authProvider: 'better-auth',
                },
            })

            // 4. Find or create role + create Membership
            console.log('[api/invite/accept] step 4: role + membership')
            let role = await tx.role.findUnique({
                where: { orgId_name: { orgId: invitation.orgId, name: roleName } },
                select: { id: true },
            })
            if (!role) {
                role = await tx.role.create({
                    data: {
                        orgId: invitation.orgId,
                        name: roleName,
                        description: roleName === 'orgAdmin' ? 'Organisation administrator' : 'Staff member',
                        scope: 'ORG',
                        permissions: {} as object,
                        isSystem: true,
                        isDefault: roleName === 'member',
                    },
                })
            }

            await tx.membership.create({
                data: {
                    orgId: invitation.orgId,
                    userId,
                    roleId: role.id,
                    status: 'ACTIVE',
                    invitedBy: null,
                    invitedAt: now,
                    activatedAt: now,
                    createdBy: userId,
                },
            })

            // 5. Create EmployeeProfile
            console.log('[api/invite/accept] step 5: employee profile')
            await tx.employeeProfile.create({
                data: {
                    id: randomUUID(),
                    orgId: invitation.orgId,
                    userId,
                    email,
                    firstName: firstName.trim(),
                    lastName: lastName.trim(),
                    displayName,
                    employeeNumber: `EMP-${Date.now().toString(36).toUpperCase()}`,
                },
            })

            // 6. Sync Better Auth org membership
            console.log('[api/invite/accept] step 6: auth org member')
            await tx.authOrgMember.create({
                data: {
                    id: randomUUID(),
                    organizationId: invitation.orgId,
                    userId,
                    role: roleName,
                },
            })

            // 7. Mark invitation accepted
            console.log('[api/invite/accept] step 7: mark accepted')
            await tx.invitation.update({
                where: { token },
                data: {
                    status: 'accepted',
                    acceptedAt: now,
                    acceptedByUserId: userId,
                },
            })
        })

        console.log('[api/invite/accept] SUCCESS for', email)
        return NextResponse.json({ success: true })
    } catch (err: unknown) {
        console.error('[api/invite/accept] FAILED:', err)
        return NextResponse.json(
            { success: false, error: 'Something went wrong creating your account. Please try again.' },
            { status: 500 },
        )
    }
}
