'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'

interface AcceptInviteFormProps {
    token: string
    email: string
    orgName: string
    inviterName: string
}

export default function AcceptInviteForm({
    token,
    email,
    orgName,
    inviterName,
}: AcceptInviteFormProps) {
    const router = useRouter()
    const [isPending, setIsPending] = useState(false)
    const [firstName, setFirstName] = useState('')
    const [lastName, setLastName] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [error, setError] = useState<string | null>(null)

    const canSubmit =
        firstName.trim() &&
        lastName.trim() &&
        password.length >= 8 &&
        password === confirmPassword

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)

        if (password !== confirmPassword) {
            setError('Passwords do not match.')
            return
        }

        if (password.length < 8) {
            setError('Password must be at least 8 characters.')
            return
        }

        setIsPending(true)

        try {
            const response = await fetch('/api/invite/accept', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    token,
                    firstName: firstName.trim(),
                    lastName: lastName.trim(),
                    password,
                }),
            })

            const result = await response.json()

            if (!result.success) {
                setError(result.error ?? 'Something went wrong. Please try again.')
                return
            }

            router.push('/sign-in?invited=true')
        } catch {
            setError('Something went wrong. Please check your connection and try again.')
        } finally {
            setIsPending(false)
        }
    }

    const inputClass =
        'block w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm shadow-sm outline-none focus:border-primary'

    return (
        <div className="orgcentral-brand flex min-h-screen items-center justify-center bg-gray-50 p-4">
            <div className="w-full max-w-md">
                <div className="mb-6 text-center">
                    <div className="text-lg font-bold" style={{ color: '#0066CC' }}>
                        OrgCentral
                    </div>
                </div>

                <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
                    <div className="mb-6">
                        <h1 className="text-xl font-semibold text-gray-900">
                            You've been invited to join {orgName}
                        </h1>
                        <p className="mt-2 text-sm text-gray-500">
                            {inviterName} has invited you to join{' '}
                            <strong>{orgName}</strong> on OrgCentral. Create your
                            account below to get started.
                        </p>
                    </div>

                    {error && (
                        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <fieldset disabled={isPending} className="space-y-4">
                            {/* Email — locked */}
                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700">
                                    Email
                                </label>
                                <input
                                    type="email"
                                    value={email}
                                    disabled
                                    className="block w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-500"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label
                                        htmlFor="firstName"
                                        className="mb-1 block text-sm font-medium text-gray-700"
                                    >
                                        First name <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        id="firstName"
                                        type="text"
                                        value={firstName}
                                        onChange={(e) => setFirstName(e.target.value)}
                                        className={inputClass}
                                        placeholder="First name"
                                        autoFocus
                                    />
                                </div>
                                <div>
                                    <label
                                        htmlFor="lastName"
                                        className="mb-1 block text-sm font-medium text-gray-700"
                                    >
                                        Last name <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        id="lastName"
                                        type="text"
                                        value={lastName}
                                        onChange={(e) => setLastName(e.target.value)}
                                        className={inputClass}
                                        placeholder="Last name"
                                    />
                                </div>
                            </div>

                            <div>
                                <label
                                    htmlFor="password"
                                    className="mb-1 block text-sm font-medium text-gray-700"
                                >
                                    Password <span className="text-red-500">*</span>
                                </label>
                                <input
                                    id="password"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className={inputClass}
                                    placeholder="At least 8 characters"
                                />
                            </div>

                            <div>
                                <label
                                    htmlFor="confirmPassword"
                                    className="mb-1 block text-sm font-medium text-gray-700"
                                >
                                    Confirm password <span className="text-red-500">*</span>
                                </label>
                                <input
                                    id="confirmPassword"
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className={inputClass}
                                    placeholder="Type your password again"
                                />
                            </div>
                        </fieldset>

                        <button
                            type="submit"
                            disabled={!canSubmit || isPending}
                            className="w-full rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:opacity-90 disabled:opacity-50"
                        >
                            {isPending ? 'Creating your account...' : 'Accept invitation'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    )
}
