'use server'

import { randomUUID } from 'node:crypto'
import { prisma } from '@/server/lib/prisma'

export interface CompleteOnboardingInput {
    userId: string
    email: string
    firstName: string
    lastName: string
    jobTitle?: string
    orgName: string
    sector: string
    orgSize: string
}

export interface CompleteOnboardingResult {
    success: boolean
    orgId?: string
    error?: string
}

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

export async function completeOnboarding(
    input: CompleteOnboardingInput,
): Promise<CompleteOnboardingResult> {
    const { userId, email, firstName, lastName, jobTitle, orgName, sector, orgSize } = input

    if (!userId || !firstName?.trim() || !lastName?.trim() || !orgName?.trim() || !sector) {
        return { success: false, error: 'Please fill in all required fields.' }
    }

    // Idempotency guard — if user already has an org, skip
    const existingMembership = await prisma.membership.findFirst({
        where: { userId, status: 'ACTIVE' },
        select: { orgId: true },
    })
    if (existingMembership) {
        return { success: true, orgId: existingMembership.orgId }
    }

    const orgId = randomUUID()
    const slug = slugify(orgName) || `org-${orgId.slice(0, 8)}`
    const now = new Date()

    try {
        // All 7 steps in a single transaction — if any fails, everything rolls back
        const result = await prisma.$transaction(async (tx) => {
            // 1. Create the Organisation
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

            // 2. Create the orgAdmin role
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

            // 3. Create the Membership
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

            // 4. Create the EmployeeProfile
            await tx.employeeProfile.create({
                data: {
                    id: randomUUID(),
                    orgId: organization.id,
                    userId,
                    email,
                    firstName: firstName.trim(),
                    lastName: lastName.trim(),
                    displayName: `${firstName.trim()} ${lastName.trim()}`,
                    jobTitle: jobTitle?.trim() || null,
                    employeeNumber: 'EMP-001',
                },
            })

            // 5. Seed default leave policies
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

            // 6. Sync Better Auth org tables
            await tx.authOrganization.create({
                data: {
                    id: organization.id,
                    slug,
                    name: orgName.trim(),
                    metadata: JSON.stringify({
                        source: 'onboarding',
                        sector,
                        orgSize,
                    }),
                },
            })

            // 7. Sync Better Auth org membership
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

        return { success: true, orgId: result }
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err)

        if (message.includes('Unique constraint') && message.includes('slug')) {
            return {
                success: false,
                error: 'An organisation with that name already exists. Please choose a different name.',
            }
        }

        return { success: false, error: 'Something went wrong setting up your organisation. Please try again.' }
    }
}
