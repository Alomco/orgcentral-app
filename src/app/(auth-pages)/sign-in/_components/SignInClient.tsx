'use client'

import SignIn from '@/components/auth/SignIn'
import { onSignInWithCredentials } from '@/server/actions/auth/handleSignIn'
import handleOauthSignIn from '@/server/actions/auth/handleOauthSignIn'
import { REDIRECT_URL_KEY } from '@/constants/app.constant'
import { useSearchParams } from 'next/navigation'
import type {
    OnSignInPayload,
    OnOauthSignInPayload,
} from '@/components/auth/SignIn'

const SignInClient = () => {
    const searchParams = useSearchParams()
    const callbackUrl = searchParams.get(REDIRECT_URL_KEY)
    const isInvited = searchParams.get('invited') === 'true'

    const handleSignIn = ({
        values,
        setSubmitting,
        setMessage,
    }: OnSignInPayload) => {
        setSubmitting(true)

        onSignInWithCredentials(values, callbackUrl || '').then((data) => {
            if (data?.error) {
                setMessage(data.error as string)
                setSubmitting(false)
            }
        })
    }

    const handleOAuthSignIn = async ({ type }: OnOauthSignInPayload) => {
        if (type === 'google') {
            await handleOauthSignIn('google')
        }
        if (type === 'github') {
            await handleOauthSignIn('github')
        }
    }

    return (
        <>
            {isInvited && (
                <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm font-medium text-emerald-700">
                    Your account is ready! Sign in to get started.
                </div>
            )}
            <SignIn onSignIn={handleSignIn} onOauthSignIn={handleOAuthSignIn} />
        </>
    )
}

export default SignInClient
