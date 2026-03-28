'use server'

import { prisma } from '@/server/lib/prisma'

export interface UpdateProfileInput {
    userId: string
    firstName: string
    lastName: string
    jobTitle?: string
    phone?: string
}

export interface UpdateProfileResult {
    success: boolean
    error?: string
}

export async function updateProfile(input: UpdateProfileInput): Promise<UpdateProfileResult> {
    const { userId, firstName, lastName, jobTitle, phone } = input

    if (!firstName?.trim() || !lastName?.trim()) {
        return { success: false, error: 'First name and last name are required.' }
    }

    const displayName = `${firstName.trim()} ${lastName.trim()}`

    const membership = await prisma.membership.findFirst({
        where: { userId, status: 'ACTIVE' },
        select: { orgId: true },
    })
    if (!membership) {
        return { success: false, error: 'No active organisation found.' }
    }

    // Update authUser name
    await prisma.authUser.update({
        where: { id: userId },
        data: { name: displayName },
    })

    // Update EmployeeProfile
    await prisma.employeeProfile.updateMany({
        where: { userId, orgId: membership.orgId },
        data: {
            firstName: firstName.trim(),
            lastName: lastName.trim(),
            displayName,
            jobTitle: jobTitle?.trim() || null,
            phone: phone?.trim() ? { number: phone.trim() } as object : undefined,
        },
    })

    return { success: true }
}
