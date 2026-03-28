'use server'

import { prisma } from '@/server/lib/prisma'

export interface ProfileData {
    firstName: string
    lastName: string
    email: string
    jobTitle: string
    phone: string
    orgName: string
    roleName: string
    memberSince: string
}

const ROLE_LABELS: Record<string, string> = {
    globalAdmin: 'Admin',
    orgAdmin: 'Manager',
    manager: 'Manager',
    member: 'Staff',
}

function formatDate(date: Date): string {
    return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

export async function getProfileData(userId: string): Promise<ProfileData | null> {
    const membership = await prisma.membership.findFirst({
        where: { userId, status: 'ACTIVE' },
        select: {
            orgId: true,
            activatedAt: true,
            invitedAt: true,
            role: { select: { name: true } },
        },
    })

    if (!membership) return null

    const [authUser, profile, org] = await Promise.all([
        prisma.authUser.findUnique({ where: { id: userId }, select: { name: true, email: true } }),
        prisma.employeeProfile.findFirst({
            where: { userId, orgId: membership.orgId },
            select: { firstName: true, lastName: true, jobTitle: true, phone: true },
        }),
        prisma.organization.findUnique({ where: { id: membership.orgId }, select: { name: true } }),
    ])

    if (!authUser) return null

    const nameParts = (authUser.name ?? '').trim().split(/\s+/)
    const phoneData = profile?.phone as Record<string, string> | null

    return {
        firstName: profile?.firstName ?? nameParts[0] ?? '',
        lastName: profile?.lastName ?? nameParts.slice(1).join(' ') ?? '',
        email: authUser.email,
        jobTitle: profile?.jobTitle ?? '',
        phone: phoneData?.number ?? '',
        orgName: org?.name ?? '',
        roleName: ROLE_LABELS[membership.role?.name ?? ''] ?? membership.role?.name ?? 'Staff',
        memberSince: formatDate(membership.activatedAt ?? membership.invitedAt ?? new Date()),
    }
}
