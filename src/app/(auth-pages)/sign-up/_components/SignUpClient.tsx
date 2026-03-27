'use client'

import { signIn } from 'next-auth/react'
import toast from '@/components/ui/toast'
import Notification from '@/components/ui/Notification'
import SignUp from '@/components/auth/SignUp'
import { signUpUser } from '@/server/actions/auth/signUpUser'
import { useRouter } from 'next/navigation'
import type { OnSignUpPayload } from '@/components/auth/SignUp'

const SignUpClient = () => {
    const router = useRouter()

    const handleSignUp = async ({
        values,
        setSubmitting,
        setMessage,
    }: OnSignUpPayload) => {
        try {
            setSubmitting(true)

            // 1. Create the account via Better Auth
            const result = await signUpUser({
                name: values.userName,
                email: values.email,
                password: values.password,
            })

            if (!result.success) {
                setMessage(result.error ?? 'Something went wrong.')
                return
            }

            // 2. Sign in automatically via NextAuth
            const signInResult = await signIn('credentials', {
                email: values.email,
                password: values.password,
                redirect: false,
            })

            if (signInResult?.error) {
                toast.push(
                    <Notification title="Account created!" type="success">
                        Your account is ready. Please sign in to continue.
                    </Notification>,
                )
                router.push('/sign-in')
                return
            }

            // 3. Redirect to onboarding
            router.push('/onboarding')
        } catch {
            setMessage('Something went wrong. Please try again.')
        } finally {
            setSubmitting(false)
        }
    }

    return <SignUp onSignUp={handleSignUp} />
}

export default SignUpClient
