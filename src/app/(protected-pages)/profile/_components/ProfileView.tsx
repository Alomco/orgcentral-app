'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { ProfileData } from '@/server/actions/profile/getProfileData'

interface ProfileViewProps {
    profile: ProfileData
}

export default function ProfileView({ profile }: ProfileViewProps) {
    const initials =
        (profile.firstName?.[0] ?? '') + (profile.lastName?.[0] ?? '')

    return (
        <div className="space-y-6 p-6">
            <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-lg font-bold text-primary">
                    {initials.toUpperCase() || '?'}
                </div>
                <div>
                    <h1 className="text-2xl font-semibold">Your profile</h1>
                    <p className="text-sm text-gray-500">{profile.email}</p>
                </div>
            </div>

            <PersonalDetailsSection profile={profile} />
            <OrganisationSection profile={profile} />
            <ChangePasswordSection />
        </div>
    )
}

// ─── Personal details ───

function PersonalDetailsSection({ profile }: { profile: ProfileData }) {
    const router = useRouter()
    const [firstName, setFirstName] = useState(profile.firstName)
    const [lastName, setLastName] = useState(profile.lastName)
    const [jobTitle, setJobTitle] = useState(profile.jobTitle)
    const [phone, setPhone] = useState(profile.phone)
    const [isPending, setIsPending] = useState(false)
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

    const handleSave = async () => {
        setMessage(null)
        setIsPending(true)
        try {
            const res = await fetch('/api/profile/update', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ firstName, lastName, jobTitle, phone }),
            })
            const result = await res.json()
            if (result.success) {
                setMessage({ type: 'success', text: 'Changes saved.' })
                router.refresh()
            } else {
                setMessage({ type: 'error', text: result.error ?? 'Something went wrong.' })
            }
        } catch {
            setMessage({ type: 'error', text: 'Something went wrong. Please try again.' })
        } finally {
            setIsPending(false)
        }
    }

    const inputClass =
        'block w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm shadow-sm outline-none focus:border-primary'

    return (
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-base font-medium text-gray-900">Personal details</h2>

            {message && (
                <div
                    className={`mt-4 rounded-xl border p-3 text-sm ${
                        message.type === 'success'
                            ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                            : 'border-red-200 bg-red-50 text-red-700'
                    }`}
                >
                    {message.text}
                </div>
            )}

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <div>
                    <label htmlFor="firstName" className="mb-1 block text-sm font-medium text-gray-700">
                        First name
                    </label>
                    <input
                        id="firstName"
                        type="text"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        className={inputClass}
                    />
                </div>
                <div>
                    <label htmlFor="lastName" className="mb-1 block text-sm font-medium text-gray-700">
                        Last name
                    </label>
                    <input
                        id="lastName"
                        type="text"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        className={inputClass}
                    />
                </div>
                <div>
                    <label htmlFor="email" className="mb-1 block text-sm font-medium text-gray-700">
                        Email
                    </label>
                    <input
                        id="email"
                        type="email"
                        value={profile.email}
                        disabled
                        className="block w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-500"
                    />
                </div>
                <div>
                    <label htmlFor="jobTitle" className="mb-1 block text-sm font-medium text-gray-700">
                        Job title
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
                <div className="sm:col-span-2">
                    <label htmlFor="phone" className="mb-1 block text-sm font-medium text-gray-700">
                        Phone number (optional)
                    </label>
                    <input
                        id="phone"
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className={inputClass}
                        placeholder="e.g. 07700 900000"
                    />
                </div>
            </div>

            <div className="mt-6">
                <button
                    onClick={handleSave}
                    disabled={isPending}
                    className="rounded-xl bg-primary px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:opacity-90 disabled:opacity-50"
                >
                    {isPending ? 'Saving...' : 'Save changes'}
                </button>
            </div>
        </div>
    )
}

// ─── Organisation (read-only) ───

function OrganisationSection({ profile }: { profile: ProfileData }) {
    return (
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-base font-medium text-gray-900">Your organisation</h2>
            <div className="mt-5 grid gap-4 sm:grid-cols-3">
                <div>
                    <div className="text-xs text-gray-400">Organisation</div>
                    <div className="mt-1 text-sm font-medium text-gray-900">{profile.orgName}</div>
                </div>
                <div>
                    <div className="text-xs text-gray-400">Your role</div>
                    <div className="mt-1 text-sm font-medium text-gray-900">{profile.roleName}</div>
                </div>
                <div>
                    <div className="text-xs text-gray-400">Member since</div>
                    <div className="mt-1 text-sm font-medium text-gray-900">{profile.memberSince}</div>
                </div>
            </div>
        </div>
    )
}

// ─── Change password ───

function ChangePasswordSection() {
    const [currentPassword, setCurrentPassword] = useState('')
    const [newPassword, setNewPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [isPending, setIsPending] = useState(false)
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

    const handleChangePassword = async () => {
        setMessage(null)

        if (newPassword.length < 8) {
            setMessage({ type: 'error', text: 'New password must be at least 8 characters.' })
            return
        }
        if (newPassword !== confirmPassword) {
            setMessage({ type: 'error', text: 'New passwords do not match.' })
            return
        }

        setIsPending(true)
        try {
            const res = await fetch('/api/profile/change-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ currentPassword, newPassword }),
            })
            const result = await res.json()
            if (result.success) {
                setMessage({ type: 'success', text: 'Password updated.' })
                setCurrentPassword('')
                setNewPassword('')
                setConfirmPassword('')
            } else {
                setMessage({ type: 'error', text: result.error ?? 'Something went wrong.' })
            }
        } catch {
            setMessage({ type: 'error', text: 'Something went wrong. Please try again.' })
        } finally {
            setIsPending(false)
        }
    }

    const inputClass =
        'block w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm shadow-sm outline-none focus:border-primary'

    return (
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-base font-medium text-gray-900">Change password</h2>

            {message && (
                <div
                    className={`mt-4 rounded-xl border p-3 text-sm ${
                        message.type === 'success'
                            ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                            : 'border-red-200 bg-red-50 text-red-700'
                    }`}
                >
                    {message.text}
                </div>
            )}

            <div className="mt-5 space-y-4">
                <div>
                    <label htmlFor="currentPassword" className="mb-1 block text-sm font-medium text-gray-700">
                        Current password
                    </label>
                    <input
                        id="currentPassword"
                        type="password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        className={inputClass}
                    />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                        <label htmlFor="newPassword" className="mb-1 block text-sm font-medium text-gray-700">
                            New password
                        </label>
                        <input
                            id="newPassword"
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className={inputClass}
                            placeholder="At least 8 characters"
                        />
                    </div>
                    <div>
                        <label htmlFor="confirmPassword" className="mb-1 block text-sm font-medium text-gray-700">
                            Confirm new password
                        </label>
                        <input
                            id="confirmPassword"
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className={inputClass}
                        />
                    </div>
                </div>
            </div>

            <div className="mt-6">
                <button
                    onClick={handleChangePassword}
                    disabled={isPending || !currentPassword || !newPassword || !confirmPassword}
                    className="rounded-xl bg-primary px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:opacity-90 disabled:opacity-50"
                >
                    {isPending ? 'Updating...' : 'Update password'}
                </button>
            </div>
        </div>
    )
}
