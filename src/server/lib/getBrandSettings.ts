import { prisma } from './prisma'
import { generateBrandPalette } from './colourContrast'

export interface BrandSettings {
    orgName: string
    brandColour: string
    logoUrl: string
    initials: string
    palette: {
        primary: string
        primaryDeep: string
        primaryMild: string
        primarySubtle: string
    }
}

const DEFAULTS: BrandSettings = {
    orgName: 'OrgCentral',
    brandColour: '#2a85ff',
    logoUrl: '',
    initials: 'OC',
    palette: generateBrandPalette('#2a85ff'),
}

function getInitials(name: string): string {
    const words = name.trim().split(/\s+/).filter(Boolean)
    if (words.length === 0) return 'OC'
    if (words.length === 1) return words[0].slice(0, 2).toUpperCase()
    return (words[0][0] + words[1][0]).toUpperCase()
}

export async function getBrandSettings(userId: string): Promise<BrandSettings> {
    const membership = await prisma.membership.findFirst({
        where: { userId, status: 'ACTIVE' },
        select: { orgId: true },
    })
    if (!membership) return DEFAULTS

    const org = await prisma.organization.findUnique({
        where: { id: membership.orgId },
        select: { name: true, settings: true },
    })
    if (!org) return DEFAULTS

    const settings = org.settings as Record<string, string> | null
    const brandColour = settings?.brandColour || DEFAULTS.brandColour
    const logoUrl = settings?.logoUrl || ''

    return {
        orgName: org.name,
        brandColour,
        logoUrl,
        initials: getInitials(org.name),
        palette: generateBrandPalette(brandColour),
    }
}

/**
 * Resolve brand settings from an orgId directly (for public pages like invite).
 */
export async function getBrandSettingsByOrgId(orgId: string): Promise<BrandSettings> {
    const org = await prisma.organization.findUnique({
        where: { id: orgId },
        select: { name: true, settings: true },
    })
    if (!org) return DEFAULTS

    const settings = org.settings as Record<string, string> | null
    const brandColour = settings?.brandColour || DEFAULTS.brandColour

    return {
        orgName: org.name,
        brandColour,
        logoUrl: settings?.logoUrl || '',
        initials: getInitials(org.name),
        palette: generateBrandPalette(brandColour),
    }
}
