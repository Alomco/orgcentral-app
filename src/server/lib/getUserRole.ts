import { prisma } from './prisma'

export interface UserRoleInfo {
    orgId: string
    roleName: string
    isAdmin: boolean
}

const ADMIN_ROLES = ['orgAdmin', 'globalAdmin', 'manager']

export async function getUserRole(userId: string): Promise<UserRoleInfo | null> {
    const membership = await prisma.membership.findFirst({
        where: { userId, status: 'ACTIVE' },
        select: {
            orgId: true,
            role: { select: { name: true } },
        },
    })

    if (!membership) return null

    const roleName = membership.role?.name ?? 'member'

    return {
        orgId: membership.orgId,
        roleName,
        isAdmin: roleName === 'orgAdmin' || roleName === 'globalAdmin',
    }
}
