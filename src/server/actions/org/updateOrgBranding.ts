'use server'

import { prisma } from '@/server/lib/prisma'
import { getUserRole } from '@/server/lib/getUserRole'

export interface UpdateOrgBrandingInput {
    userId: string
    brandColour: string
    logoUrl: string
}

export interface UpdateOrgBrandingResult {
    success: boolean
    error?: string
}

export async function updateOrgBranding(input: UpdateOrgBrandingInput): Promise<UpdateOrgBrandingResult> {
    const { userId, brandColour, logoUrl } = input

    const role = await getUserRole(userId)
    if (!role) {
        return { success: false, error: 'No active organisation found.' }
    }
    if (!role.isAdmin) {
        return { success: false, error: 'You need to be an admin to change branding.' }
    }

    // Read existing settings, merge branding
    const org = await prisma.organization.findUnique({
        where: { id: role.orgId },
        select: { settings: true },
    })

    const existing = (org?.settings as Record<string, unknown>) ?? {}

    await prisma.organization.update({
        where: { id: role.orgId },
        data: {
            settings: {
                ...existing,
                brandColour: brandColour || '#2a85ff',
                logoUrl: logoUrl?.trim() || '',
            } as object,
        },
    })

    return { success: true }
}
