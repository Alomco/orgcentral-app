'use server'

import { prisma } from '@/server/lib/prisma'

export interface TeamMemberRow {
    id: string
    name: string
    email: string
    role: string
    roleId: string
    joinedAt: string
}

function formatDate(date: Date): string {
    return date.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    })
}

const ROLE_LABELS: Record<string, string> = {
    globalAdmin: 'Admin',
    orgAdmin: 'Manager',
    manager: 'Manager',
    member: 'Staff',
}

export async function getTeamMembers(userId: string): Promise<TeamMemberRow[]> {
    const membership = await prisma.membership.findFirst({
        where: { userId, status: 'ACTIVE' },
        select: { orgId: true },
    })
    if (!membership) return []

    const members = await prisma.membership.findMany({
        where: { orgId: membership.orgId, status: 'ACTIVE' },
        select: {
            userId: true,
            activatedAt: true,
            invitedAt: true,
            roleId: true,
            role: { select: { name: true } },
        },
        orderBy: { activatedAt: 'asc' },
    })

    const userIds = members.map((m) => m.userId)
    const users = await prisma.authUser.findMany({
        where: { id: { in: userIds } },
        select: { id: true, name: true, email: true },
    })
    const userMap = new Map(users.map((u) => [u.id, u]))

    return members.map((m): TeamMemberRow => {
        const user = userMap.get(m.userId)
        return {
            id: m.userId,
            name: user?.name ?? user?.email?.split('@')[0] ?? 'Unknown',
            email: user?.email ?? '',
            role: ROLE_LABELS[m.role?.name ?? ''] ?? m.role?.name ?? 'Staff',
            roleId: m.roleId ?? '',
            joinedAt: formatDate(m.activatedAt ?? m.invitedAt ?? new Date()),
        }
    })
}
