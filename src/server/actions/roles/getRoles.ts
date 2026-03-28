'use server'

import { prisma } from '@/server/lib/prisma'
import { getUserRole } from '@/server/lib/getUserRole'

export interface RoleMember {
    name: string
}

export interface RoleRow {
    id: string
    name: string
    description: string
    permissions: string[]
    memberCount: number
    members: RoleMember[]
    isSystem: boolean
    isDefault: boolean
}

export async function getRoles(userId: string): Promise<RoleRow[]> {
    const role = await getUserRole(userId)
    if (!role) return []

    const roles = await prisma.role.findMany({
        where: { orgId: role.orgId },
        select: {
            id: true,
            name: true,
            description: true,
            permissions: true,
            isSystem: true,
            isDefault: true,
            _count: { select: { memberships: true } },
            memberships: {
                select: {
                    profile: {
                        select: { firstName: true, lastName: true },
                    },
                },
                take: 5,
            },
        },
        orderBy: { createdAt: 'asc' },
    })

    return roles.map((r): RoleRow => {
        const perms = r.permissions
        let permArray: string[] = []
        if (Array.isArray(perms)) {
            permArray = perms as string[]
        } else if (typeof perms === 'object' && perms !== null) {
            // Legacy format — extract keys with truthy values
            permArray = Object.entries(perms as Record<string, unknown>)
                .filter(([, v]) => v === true)
                .map(([k]) => k)
        }

        const members: RoleMember[] = r.memberships.map((m) => {
            const first = m.profile?.firstName ?? ''
            const last = m.profile?.lastName ?? ''
            return { name: `${first} ${last}`.trim() || 'Unknown' }
        })

        return {
            id: r.id,
            name: r.name,
            description: r.description ?? '',
            permissions: permArray,
            memberCount: r._count.memberships,
            members,
            isSystem: r.isSystem,
            isDefault: r.isDefault,
        }
    })
}
