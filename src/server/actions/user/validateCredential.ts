'use server'
import type { SignInCredential } from '@/@types/auth'
import { prisma } from '@/server/lib/prisma'
import { verifyPassword } from 'better-auth/crypto'

const validateCredential = async (values: SignInCredential) => {
    const { email, password } = values

    // Find the auth user by email
    const authUser = await prisma.authUser.findUnique({
        where: { email: email.toLowerCase().trim() },
        select: { id: true, name: true, email: true, image: true },
    })
    if (!authUser) {
        return null
    }

    // Find the credential account and verify password
    const account = await prisma.authAccount.findFirst({
        where: { userId: authUser.id, providerId: 'credential' },
        select: { password: true },
    })
    if (!account?.password) {
        return null
    }

    const valid = await verifyPassword({
        password,
        hash: account.password,
    })
    if (!valid) {
        return null
    }

    // Look up the user's role from their first active membership
    const membership = await prisma.membership.findFirst({
        where: { userId: authUser.id, status: 'ACTIVE' },
        select: {
            role: { select: { name: true } },
        },
    })

    const authority = membership?.role?.name
        ? [membership.role.name]
        : ['member']

    return {
        id: authUser.id,
        userName: authUser.name ?? authUser.email.split('@')[0],
        email: authUser.email,
        avatar: authUser.image ?? '',
        authority,
    }
}

export default validateCredential
