'use server'

import { prisma } from '@/server/lib/prisma'
import { getUserRole } from '@/server/lib/getUserRole'

export interface UpdateOrgDetailsInput {
    userId: string
    name: string
    sector: string
    size: string
}

export interface UpdateOrgDetailsResult {
    success: boolean
    error?: string
}

export async function updateOrgDetails(input: UpdateOrgDetailsInput): Promise<UpdateOrgDetailsResult> {
    const { userId, name, sector, size } = input

    if (!name?.trim()) {
        return { success: false, error: 'Organisation name is required.' }
    }

    const role = await getUserRole(userId)
    if (!role) {
        return { success: false, error: 'No active organisation found.' }
    }
    if (!role.isAdmin) {
        return { success: false, error: 'You need to be an admin to change these settings.' }
    }

    await prisma.organization.update({
        where: { id: role.orgId },
        data: {
            name: name.trim(),
            industry: sector || null,
            employeeCountRange: size || null,
        },
    })

    return { success: true }
}
