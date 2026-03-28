'use server'

import { prisma } from '@/server/lib/prisma'
import { getUserRole } from '@/server/lib/getUserRole'

export interface DeleteRoleInput {
    userId: string
    roleId: string
}

export interface DeleteRoleResult {
    success: boolean
    error?: string
}

export async function deleteRole(input: DeleteRoleInput): Promise<DeleteRoleResult> {
    const { userId, roleId } = input

    const userRole = await getUserRole(userId)
    if (!userRole?.isAdmin) {
        return { success: false, error: 'Only admins can delete roles.' }
    }

    const role = await prisma.role.findUnique({
        where: { id: roleId },
        select: {
            orgId: true,
            name: true,
            isSystem: true,
            _count: { select: { memberships: true } },
        },
    })

    if (!role || role.orgId !== userRole.orgId) {
        return { success: false, error: 'Role not found.' }
    }

    if (role.isSystem) {
        return { success: false, error: 'System roles cannot be deleted.' }
    }

    if (role._count.memberships > 0) {
        return {
            success: false,
            error: `This role has ${role._count.memberships} member${role._count.memberships !== 1 ? 's' : ''}. Move them to another role first.`,
        }
    }

    await prisma.role.delete({ where: { id: roleId } })

    return { success: true }
}
