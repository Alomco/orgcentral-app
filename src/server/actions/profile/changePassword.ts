'use server'

import { prisma } from '@/server/lib/prisma'
import { verifyPassword, hashPassword } from 'better-auth/crypto'

export interface ChangePasswordInput {
    userId: string
    currentPassword: string
    newPassword: string
}

export interface ChangePasswordResult {
    success: boolean
    error?: string
}

export async function changePassword(input: ChangePasswordInput): Promise<ChangePasswordResult> {
    const { userId, currentPassword, newPassword } = input

    if (!currentPassword || !newPassword) {
        return { success: false, error: 'Please fill in all password fields.' }
    }

    if (newPassword.length < 8) {
        return { success: false, error: 'New password must be at least 8 characters.' }
    }

    // Find the credential account
    const account = await prisma.authAccount.findFirst({
        where: { userId, providerId: 'credential' },
        select: { id: true, password: true },
    })

    if (!account?.password) {
        return { success: false, error: 'No password is set for this account.' }
    }

    // Verify current password
    const valid = await verifyPassword({
        password: currentPassword,
        hash: account.password,
    })

    if (!valid) {
        return { success: false, error: 'Current password is incorrect.' }
    }

    // Hash and update
    const newHash = await hashPassword(newPassword)
    await prisma.authAccount.update({
        where: { id: account.id },
        data: { password: newHash },
    })

    return { success: true }
}
