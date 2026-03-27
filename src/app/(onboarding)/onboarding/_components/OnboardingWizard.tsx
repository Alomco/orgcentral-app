'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'

interface OnboardingWizardProps {
    userId: string
    email: string
    defaultFirstName: string
    defaultLastName: string
}

const SECTORS = [
    'NHS Primary Care',
    'NHS Secondary Care',
    'Community Health',
    'Mental Health',
    'Local Authority',
    'Education',
    'Other',
]

const ORG_SIZES = ['1-10', '11-50', '51-200', '200+']

export default function OnboardingWizard({
    userId,
    email,
    defaultFirstName,
    defaultLastName,
}: OnboardingWizardProps) {
    const router = useRouter()
    const [isPending, setIsPending] = useState(false)
    const [step, setStep] = useState(1)
    const [error, setError] = useState<string | null>(null)

    // Step 1 fields
    const [firstName, setFirstName] = useState(defaultFirstName)
    const [lastName, setLastName] = useState(defaultLastName)
    const [jobTitle, setJobTitle] = useState('')

    // Step 2 fields
    const [orgName, setOrgName] = useState('')
    const [sector, setSector] = useState('')
    const [orgSize, setOrgSize] = useState('')

    const canProceedStep1 = firstName.trim() && lastName.trim()
    const canProceedStep2 = orgName.trim() && sector

    const handleFinish = async () => {
        setError(null)
        setIsPending(true)

        try {
            const response = await fetch('/api/onboarding/complete', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email,
                    firstName: firstName.trim(),
                    lastName: lastName.trim(),
                    jobTitle: jobTitle.trim() || undefined,
                    orgName: orgName.trim(),
                    sector,
                    orgSize,
                }),
            })

            const result = await response.json()

            if (!result.success) {
                setError(result.error ?? 'Something went wrong. Please try again.')
                return
            }

            router.push('/hr/leave/requests')
        } catch {
            setError('Something went wrong. Please check your connection and try again.')
        } finally {
            setIsPending(false)
        }
    }

    const inputClass =
        'block w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm shadow-sm outline-none focus:border-primary'

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
            <div className="w-full max-w-md">
                {/* Step indicator */}
                <div className="mb-6 flex items-center justify-center gap-2">
                    {[1, 2, 3].map((s) => (
                        <div
                            key={s}
                            className={`h-2 rounded-full transition-all ${
                                s === step
                                    ? 'w-8 bg-primary'
                                    : s < step
                                      ? 'w-8 bg-primary/40'
                                      : 'w-8 bg-gray-200'
                            }`}
                        />
                    ))}
                </div>

                <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
                    {error && (
                        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                            {error}
                        </div>
                    )}

                    {/* Step 1: About you */}
                    {step === 1 && (
                        <div className="space-y-5">
                            <div>
                                <h1 className="text-xl font-semibold text-gray-900">
                                    Let's get to know you
                                </h1>
                                <p className="mt-1 text-sm text-gray-500">
                                    Just a few details so your team knows who you are.
                                </p>
                            </div>

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
                                    placeholder="e.g. Sarah"
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
                                    placeholder="e.g. Johnson"
                                />
                            </div>

                            <div>
                                <label
                                    htmlFor="jobTitle"
                                    className="mb-1 block text-sm font-medium text-gray-700"
                                >
                                    Job title (optional)
                                </label>
                                <input
                                    id="jobTitle"
                                    type="text"
                                    value={jobTitle}
                                    onChange={(e) => setJobTitle(e.target.value)}
                                    className={inputClass}
                                    placeholder="e.g. Practice Manager"
                                />
                            </div>

                            <button
                                type="button"
                                onClick={() => setStep(2)}
                                disabled={!canProceedStep1}
                                className="w-full rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:opacity-90 disabled:opacity-50"
                            >
                                Continue
                            </button>
                        </div>
                    )}

                    {/* Step 2: Your organisation */}
                    {step === 2 && (
                        <div className="space-y-5">
                            <div>
                                <h1 className="text-xl font-semibold text-gray-900">
                                    Tell us about your organisation
                                </h1>
                                <p className="mt-1 text-sm text-gray-500">
                                    We'll set up a workspace for your team.
                                </p>
                            </div>

                            <div>
                                <label
                                    htmlFor="orgName"
                                    className="mb-1 block text-sm font-medium text-gray-700"
                                >
                                    Organisation name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    id="orgName"
                                    type="text"
                                    value={orgName}
                                    onChange={(e) => setOrgName(e.target.value)}
                                    className={inputClass}
                                    placeholder="e.g. Tower Hamlets PCN"
                                    autoFocus
                                />
                            </div>

                            <div>
                                <label
                                    htmlFor="sector"
                                    className="mb-1 block text-sm font-medium text-gray-700"
                                >
                                    Sector <span className="text-red-500">*</span>
                                </label>
                                <select
                                    id="sector"
                                    value={sector}
                                    onChange={(e) => setSector(e.target.value)}
                                    className={inputClass}
                                >
                                    <option value="">Choose your sector</option>
                                    {SECTORS.map((s) => (
                                        <option key={s} value={s}>
                                            {s}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label
                                    htmlFor="orgSize"
                                    className="mb-1 block text-sm font-medium text-gray-700"
                                >
                                    Team size
                                </label>
                                <div className="flex flex-wrap gap-2">
                                    {ORG_SIZES.map((size) => (
                                        <button
                                            key={size}
                                            type="button"
                                            onClick={() => setOrgSize(size)}
                                            className={`rounded-xl border px-3 py-1.5 text-sm font-medium transition ${
                                                orgSize === size
                                                    ? 'border-primary bg-primary/10 text-primary'
                                                    : 'border-gray-300 text-gray-600 hover:bg-gray-50'
                                            }`}
                                        >
                                            {size} people
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setStep(1)}
                                    className="rounded-xl border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
                                >
                                    Back
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setStep(3)}
                                    disabled={!canProceedStep2}
                                    className="flex-1 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:opacity-90 disabled:opacity-50"
                                >
                                    Continue
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Step 3: You're all set */}
                    {step === 3 && (
                        <div className="space-y-5">
                            <div>
                                <h1 className="text-xl font-semibold text-gray-900">
                                    Everything looks good
                                </h1>
                                <p className="mt-1 text-sm text-gray-500">
                                    Here's what we'll set up for you.
                                </p>
                            </div>

                            {/* Summary */}
                            <div className="space-y-3">
                                <div className="rounded-xl bg-gray-50 p-4">
                                    <div className="text-xs font-medium uppercase tracking-wide text-gray-400">
                                        You
                                    </div>
                                    <div className="mt-1 text-sm font-medium text-gray-900">
                                        {firstName} {lastName}
                                    </div>
                                    {jobTitle && (
                                        <div className="text-sm text-gray-500">
                                            {jobTitle}
                                        </div>
                                    )}
                                </div>

                                <div className="rounded-xl bg-gray-50 p-4">
                                    <div className="text-xs font-medium uppercase tracking-wide text-gray-400">
                                        Organisation
                                    </div>
                                    <div className="mt-1 text-sm font-medium text-gray-900">
                                        {orgName}
                                    </div>
                                    <div className="text-sm text-gray-500">
                                        {sector}
                                        {orgSize ? ` · ${orgSize} people` : ''}
                                    </div>
                                </div>
                            </div>

                            {/* What you get */}
                            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                                <div className="text-sm font-medium text-emerald-800">
                                    Your free annual leave management is ready
                                </div>
                                <p className="mt-1 text-sm text-emerald-600">
                                    You can start using it straight away — request
                                    time off, manage your team's leave, and keep
                                    everything in one place. No setup needed.
                                </p>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setStep(2)}
                                    disabled={isPending}
                                    className="rounded-xl border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
                                >
                                    Back
                                </button>
                                <button
                                    type="button"
                                    onClick={handleFinish}
                                    disabled={isPending}
                                    className="flex-1 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:opacity-90 disabled:opacity-50"
                                >
                                    {isPending
                                        ? 'Setting things up...'
                                        : 'Get started'}
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Step label below card */}
                <div className="mt-4 text-center text-xs text-gray-400">
                    Step {step} of 3
                </div>
            </div>
        </div>
    )
}
