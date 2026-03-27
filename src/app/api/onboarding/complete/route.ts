import { NextResponse } from 'next/server'
import { randomUUID } from 'node:crypto'
import { auth } from '@/auth'
import { prisma } from '@/server/lib/prisma'

const DEFAULT_LEAVE_POLICIES = [
    { name: 'Annual Leave', policyType: 'ANNUAL' as const },
    { name: 'Medical Leave', policyType: 'SICK' as const },
    { name: 'Emergency Leave', policyType: 'EMERGENCY' as const },
    { name: 'Unpaid Leave', policyType: 'UNPAID' as const },
]

function slugify(name: string): string {
    const base = name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '')
        .slice(0, 55)
    const suffix = randomUUID().replace(/-/g, '').slice(0, 4)
    return `${base}-${suffix}`
}

export async function POST(request: Request) {
    try {
        const session = await auth()
        const userId = session?.user?.id

        if (!userId) {
            return NextResponse.json(
                { success: false, error: 'Not signed in.' },
                { status: 401 },
            )
        }

        const body = await request.json()
        const { email, firstName, lastName, jobTitle, orgName, sector, orgSize } = body

        console.log('[api/onboarding/complete] starting', { userId, orgName, sector })

        if (!firstName?.trim() || !lastName?.trim() || !orgName?.trim() || !sector) {
            return NextResponse.json(
                { success: false, error: 'Please fill in all required fields.' },
                { status: 400 },
            )
        }

        // Idempotency guard
        const existingMembership = await prisma.membership.findFirst({
            where: { userId, status: 'ACTIVE' },
            select: { orgId: true },
        })
        if (existingMembership) {
            console.log('[api/onboarding/complete] user already has org:', existingMembership.orgId)
            return NextResponse.json({ success: true, orgId: existingMembership.orgId })
        }

        const orgId = randomUUID()
        const slug = slugify(orgName) || `org-${orgId.slice(0, 8)}`
        const now = new Date()

        console.log('[api/onboarding/complete] creating org', { orgId, slug })

        const result = await prisma.$transaction(async (tx) => {
            // 1. Organisation
            console.log('[api/onboarding/complete] step 1: organisation')
            const organization = await tx.organization.create({
                data: {
                    id: orgId,
                    slug,
                    name: orgName.trim(),
                    tenantId: orgId,
                    regionCode: 'UK-LON',
                    status: 'ACTIVE',
                    complianceTier: 'STANDARD',
                    dataResidency: 'UK_ONLY',
                    dataClassification: 'OFFICIAL',
                    industry: sector,
                    employeeCountRange: orgSize || null,
                },
            })

            // 2. Sync platform User record (Membership FK requires it)
            console.log('[api/onboarding/complete] step 2: sync platform user')
            await tx.user.upsert({
                where: { id: userId },
                update: {
                    email: email || session?.user?.email || '',
                    displayName: `${firstName.trim()} ${lastName.trim()}`,
                    status: 'ACTIVE',
                },
                create: {
                    id: userId,
                    email: email || session?.user?.email || '',
                    displayName: `${firstName.trim()} ${lastName.trim()}`,
                    status: 'ACTIVE',
                    authProvider: 'better-auth',
                },
            })

            // 3. orgAdmin role
            console.log('[api/onboarding/complete] step 3: role')
            const role = await tx.role.create({
                data: {
                    orgId: organization.id,
                    name: 'orgAdmin',
                    description: 'Organisation administrator with full access',
                    scope: 'ORG',
                    permissions: {
                        hr: { read: true, write: true, approve: true },
                        org: { read: true, write: true, manage: true },
                        members: { read: true, invite: true, manage: true },
                    } as object,
                    isSystem: true,
                    isDefault: true,
                },
            })

            // 4. Membership
            console.log('[api/onboarding/complete] step 4: membership')
            await tx.membership.create({
                data: {
                    orgId: organization.id,
                    userId,
                    roleId: role.id,
                    status: 'ACTIVE',
                    invitedBy: null,
                    invitedAt: now,
                    activatedAt: now,
                    createdBy: userId,
                },
            })

            // 5. EmployeeProfile
            console.log('[api/onboarding/complete] step 5: profile')
            await tx.employeeProfile.create({
                data: {
                    id: randomUUID(),
                    orgId: organization.id,
                    userId,
                    email: email || session?.user?.email || '',
                    firstName: firstName.trim(),
                    lastName: lastName.trim(),
                    displayName: `${firstName.trim()} ${lastName.trim()}`,
                    jobTitle: jobTitle?.trim() || null,
                    employeeNumber: 'EMP-001',
                },
            })

            // 6. Default leave policies
            console.log('[api/onboarding/complete] step 6: leave policies')
            for (const policy of DEFAULT_LEAVE_POLICIES) {
                await tx.leavePolicy.create({
                    data: {
                        id: randomUUID(),
                        orgId: organization.id,
                        name: policy.name,
                        policyType: policy.policyType,
                        requiresApproval: true,
                        isDefault: policy.policyType === 'ANNUAL',
                        activeFrom: new Date('2026-01-01'),
                    },
                })
            }

            // 7. Better Auth org
            console.log('[api/onboarding/complete] step 7: auth org')
            await tx.authOrganization.create({
                data: {
                    id: organization.id,
                    slug,
                    name: orgName.trim(),
                    metadata: JSON.stringify({ source: 'onboarding', sector, orgSize }),
                },
            })

            // 8. Better Auth org member
            console.log('[api/onboarding/complete] step 8: auth org member')
            await tx.authOrgMember.create({
                data: {
                    id: randomUUID(),
                    organizationId: organization.id,
                    userId,
                    role: 'orgAdmin',
                },
            })

            return organization.id
        })

        console.log('[api/onboarding/complete] SUCCESS:', result)
        return NextResponse.json({ success: true, orgId: result })
    } catch (err: unknown) {
        console.error('[api/onboarding/complete] FAILED:', err)

        const message = err instanceof Error ? err.message : String(err)

        if (message.includes('Unique constraint') && message.includes('slug')) {
            return NextResponse.json(
                { success: false, error: 'An organisation with that name already exists. Please choose a different name.' },
                { status: 409 },
            )
        }

        return NextResponse.json(
            { success: false, error: 'Something went wrong setting up your organisation. Please try again.' },
            { status: 500 },
        )
    }
}
