'use server'

import { prisma } from '@/server/lib/prisma'
import { getUserRole } from '@/server/lib/getUserRole'

export interface CreateRoleInput {
    userId: string
    name: string
    description?: string
    permissions: string[]
}

export interface CreateRoleResult {
    success: boolean
    error?: string
}

export async function createRole(input: CreateRoleInput): Promise<CreateRoleResult> {
    const { userId, name, description, permissions } = input

    if (!name?.trim()) {
        return { success: false, error: 'Role name is required.' }
    }

    const role = await getUserRole(userId)
    if (!role?.isAdmin) {
        return { success: false, error: 'Only admins can create roles.' }
    }

    // Check for duplicate name
    const existing = await prisma.role.findUnique({
        where: { orgId_name: { orgId: role.orgId, name: name.trim() } },
        select: { id: true },
    })
    if (existing) {
        return { success: false, error: 'A role with that name already exists.' }
    }

    await prisma.role.create({
        data: {
            orgId: role.orgId,
            name: name.trim(),
            description: description?.trim() || null,
            scope: 'ORG',
            permissions: permissions as unknown as object,
            isSystem: false,
            isDefault: false,
        },
    })

    return { success: true }
}
