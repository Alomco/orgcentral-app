'use server'

import { prisma } from '@/server/lib/prisma'
import { getUserRole } from '@/server/lib/getUserRole'

export interface OrgSettings {
    orgId: string
    name: string
    sector: string
    size: string
    brandColour: string
    logoUrl: string
}

export async function getOrgSettings(userId: string): Promise<OrgSettings | null> {
    const role = await getUserRole(userId)
    if (!role) return null

    const org = await prisma.organization.findUnique({
        where: { id: role.orgId },
        select: {
            id: true,
            name: true,
            industry: true,
            employeeCountRange: true,
            settings: true,
        },
    })
    if (!org) return null

    const settings = org.settings as Record<string, string> | null

    return {
        orgId: org.id,
        name: org.name,
        sector: org.industry ?? '',
        size: org.employeeCountRange ?? '',
        brandColour: settings?.brandColour ?? '#2a85ff',
        logoUrl: settings?.logoUrl ?? '',
    }
}
