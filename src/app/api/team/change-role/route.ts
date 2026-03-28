import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/server/lib/prisma'
import { getUserRole } from '@/server/lib/getUserRole'

export async function POST(request: Request) {
    const session = await auth()
    if (!session?.user?.id) {
        return NextResponse.json({ success: false, error: 'Not signed in.' }, { status: 401 })
    }

    const body = await request.json()
    const { memberId, roleId } = body

    if (!memberId || !roleId) {
        return NextResponse.json({ success: false, error: 'Missing fields.' }, { status: 400 })
    }

    const userRole = await getUserRole(session.user.id)
    if (!userRole?.isAdmin) {
        return NextResponse.json({ success: false, error: 'Only admins can change roles.' }, { status: 403 })
    }

    // Verify the target role belongs to the same org
    const role = await prisma.role.findUnique({
        where: { id: roleId },
        select: { orgId: true },
    })
    if (!role || role.orgId !== userRole.orgId) {
        return NextResponse.json({ success: false, error: 'Role not found.' }, { status: 404 })
    }

    // Find the membership
    const membership = await prisma.membership.findFirst({
        where: { userId: memberId, orgId: userRole.orgId, status: 'ACTIVE' },
        select: { orgId: true, userId: true },
    })
    if (!membership) {
        return NextResponse.json({ success: false, error: 'Member not found.' }, { status: 404 })
    }

    // Prevent removing the last orgAdmin
    const currentRole = await prisma.membership.findFirst({
        where: { userId: memberId, orgId: userRole.orgId },
        select: { role: { select: { name: true } } },
    })
    if (currentRole?.role?.name === 'orgAdmin') {
        const adminCount = await prisma.membership.count({
            where: { orgId: userRole.orgId, status: 'ACTIVE', role: { name: 'orgAdmin' } },
        })
        if (adminCount <= 1) {
            return NextResponse.json({
                success: false,
                error: 'Cannot change the last admin. Promote someone else first.',
            }, { status: 400 })
        }
    }

    await prisma.membership.update({
        where: { orgId_userId: { orgId: userRole.orgId, userId: memberId } },
        data: { roleId },
    })

    return NextResponse.json({ success: true })
}
