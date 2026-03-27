'use server'

import { auth } from '@/server/lib/auth'

export interface SignUpUserInput {
    name: string
    email: string
    password: string
}

export interface SignUpUserResult {
    success: boolean
    error?: string
}

export async function signUpUser(
    input: SignUpUserInput,
): Promise<SignUpUserResult> {
    const { name, email, password } = input

    if (!name?.trim() || !email?.trim() || !password) {
        return { success: false, error: 'Please fill in all fields.' }
    }

    if (password.length < 8) {
        return { success: false, error: 'Password must be at least 8 characters.' }
    }

    try {
        const result = await auth.api.signUpEmail({
            body: {
                name: name.trim(),
                email: email.trim().toLowerCase(),
                password,
            },
        })

        if (!result?.user) {
            return { success: false, error: 'Could not create your account. Please try again.' }
        }

        return { success: true }
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err)

        if (message.includes('already') || message.includes('exists') || message.includes('duplicate')) {
            return { success: false, error: 'That email is already registered. Try signing in instead.' }
        }

        return { success: false, error: 'Something went wrong creating your account. Please try again.' }
    }
}
