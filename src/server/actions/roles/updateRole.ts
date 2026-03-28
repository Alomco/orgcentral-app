'use server'

import { prisma } from '@/server/lib/prisma'
import { getUserRole } from '@/server/lib/getUserRole'

export interface UpdateRoleInput {
    userId: string
    roleId: string
    name: string
    description?: string
    permissions: string[]
}

export interface UpdateRoleResult {
    success: boolean
    error?: string
}

export async function updateRole(input: UpdateRoleInput): Promise<UpdateRoleResult> {
    const { userId, roleId, name, description, permissions } = input

    if (!name?.trim()) {
        return { success: false, error: 'Role name is required.' }
    }

    const userRole = await getUserRole(userId)
    if (!userRole?.isAdmin) {
        return { success: false, error: 'Only admins can edit roles.' }
    }

    const existing = await prisma.role.findUnique({
        where: { id: roleId },
        select: { orgId: true, name: true, isSystem: true },
    })

    if (!existing || existing.orgId !== userRole.orgId) {
        return { success: false, error: 'Role not found.' }
    }

    // System roles cannot have their name changed
    const updateName = existing.isSystem ? existing.name : name.trim()

    // Check for name clash if name is changing
    if (updateName !== existing.name) {
        const clash = await prisma.role.findUnique({
            where: { orgId_name: { orgId: userRole.orgId, name: updateName } },
            select: { id: true },
        })
        if (clash && clash.id !== roleId) {
            return { success: false, error: 'A role with that name already exists.' }
        }
    }

    await prisma.role.update({
        where: { id: roleId },
        data: {
            name: updateName,
            description: description?.trim() || null,
            permissions: permissions as unknown as object,
        },
    })

    return { success: true }
}
