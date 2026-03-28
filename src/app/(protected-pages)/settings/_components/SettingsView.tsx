'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { OrgSettings } from '@/server/actions/org/getOrgSettings'

interface SettingsViewProps {
    settings: OrgSettings
}

const SECTORS = [
    'Healthcare',
    'Education',
    'Local Government',
    'Emergency Services',
    'Housing',
    'Charity / Non-profit',
    'Other',
]

const ORG_SIZES = ['1-10', '11-50', '51-200', '200+']

const inputClass =
    'block w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm shadow-sm outline-none focus:border-primary'

export default function SettingsView({ settings }: SettingsViewProps) {
    return (
        <div className="space-y-6 p-6">
            <h1 className="text-2xl font-semibold">Organisation settings</h1>
            <OrgDetailsSection settings={settings} />
            <BrandingSection settings={settings} />
            <DangerZoneSection orgName={settings.name} />
        </div>
    )
}

// ─── Organisation details ───

function OrgDetailsSection({ settings }: { settings: OrgSettings }) {
    const router = useRouter()
    const [name, setName] = useState(settings.name)
    const [sector, setSector] = useState(settings.sector)
    const [size, setSize] = useState(settings.size)
    const [isPending, setIsPending] = useState(false)
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

    const handleSave = async () => {
        setMessage(null)
        setIsPending(true)
        try {
            const res = await fetch('/api/org/update-details', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, sector, size }),
            })
            const result = await res.json()
            if (result.success) {
                setMessage({ type: 'success', text: 'Organisation details saved.' })
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

    return (
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-base font-medium text-gray-900">Organisation details</h2>
            <p className="mt-1 text-sm text-gray-500">Basic information about your organisation.</p>

            {message && (
                <div className={`mt-4 rounded-xl border p-3 text-sm ${message.type === 'success' ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-red-200 bg-red-50 text-red-700'}`}>
                    {message.text}
                </div>
            )}

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                    <label htmlFor="orgName" className="mb-1 block text-sm font-medium text-gray-700">
                        Organisation name
                    </label>
                    <input
                        id="orgName"
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className={inputClass}
                    />
                </div>
                <div>
                    <label htmlFor="sector" className="mb-1 block text-sm font-medium text-gray-700">
                        Sector
                    </label>
                    <select
                        id="sector"
                        value={sector}
                        onChange={(e) => setSector(e.target.value)}
                        className={inputClass}
                    >
                        <option value="">Select sector</option>
                        {SECTORS.map((s) => (
                            <option key={s} value={s}>{s}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                        Team size
                    </label>
                    <div className="flex flex-wrap gap-2">
                        {ORG_SIZES.map((s) => (
                            <button
                                key={s}
                                type="button"
                                onClick={() => setSize(s)}
                                className={`rounded-xl border px-3 py-1.5 text-sm font-medium transition ${size === s ? 'border-primary bg-primary/10 text-primary' : 'border-gray-300 text-gray-600 hover:bg-gray-50'}`}
                            >
                                {s}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="mt-6">
                <button onClick={handleSave} disabled={isPending} className="rounded-xl bg-primary px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:opacity-90 disabled:opacity-50">
                    {isPending ? 'Saving...' : 'Save details'}
                </button>
            </div>
        </div>
    )
}

// ─── Branding ───

function BrandingSection({ settings }: { settings: OrgSettings }) {
    const router = useRouter()
    const [brandColour, setBrandColour] = useState(settings.brandColour)
    const [logoUrl, setLogoUrl] = useState(settings.logoUrl)
    const [isPending, setIsPending] = useState(false)
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

    const handleSave = async () => {
        setMessage(null)
        setIsPending(true)
        try {
            const res = await fetch('/api/org/update-branding', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ brandColour, logoUrl }),
            })
            const result = await res.json()
            if (result.success) {
                setMessage({ type: 'success', text: 'Branding saved.' })
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

    return (
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-base font-medium text-gray-900">Branding</h2>
            <p className="mt-1 text-sm text-gray-500">
                Customise how OrgCentral looks for your team. Changes apply to all members.
            </p>

            {message && (
                <div className={`mt-4 rounded-xl border p-3 text-sm ${message.type === 'success' ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-red-200 bg-red-50 text-red-700'}`}>
                    {message.text}
                </div>
            )}

            <div className="mt-5 grid gap-6 lg:grid-cols-2">
                {/* Controls */}
                <div className="space-y-4">
                    <div>
                        <label htmlFor="brandColour" className="mb-1 block text-sm font-medium text-gray-700">
                            Brand colour
                        </label>
                        <div className="flex items-center gap-3">
                            <input
                                id="brandColour"
                                type="color"
                                value={brandColour}
                                onChange={(e) => setBrandColour(e.target.value)}
                                className="h-10 w-14 cursor-pointer rounded-lg border border-gray-300"
                            />
                            <input
                                type="text"
                                value={brandColour}
                                onChange={(e) => setBrandColour(e.target.value)}
                                className={inputClass + ' flex-1'}
                                placeholder="#0066CC"
                                maxLength={7}
                            />
                        </div>
                        <p className="mt-1 text-xs text-gray-400">
                            Used for buttons, active states, and accents throughout the app.
                        </p>
                    </div>
                    <div>
                        <label htmlFor="logoUrl" className="mb-1 block text-sm font-medium text-gray-700">
                            Logo URL (optional)
                        </label>
                        <input
                            id="logoUrl"
                            type="url"
                            value={logoUrl}
                            onChange={(e) => setLogoUrl(e.target.value)}
                            className={inputClass}
                            placeholder="https://example.com/logo.png"
                        />
                        <p className="mt-1 text-xs text-gray-400">
                            Image upload coming soon. For now, paste a URL to your logo.
                        </p>
                    </div>
                </div>

                {/* Live preview */}
                <div>
                    <div className="mb-2 text-xs font-medium uppercase tracking-wide text-gray-400">
                        Live preview
                    </div>
                    <div className="overflow-hidden rounded-xl border border-gray-200 shadow-sm">
                        {/* Mini sidebar mockup */}
                        <div
                            className="p-4 transition-colors duration-200"
                            style={{ backgroundColor: brandColour }}
                        >
                            <div className="text-sm font-bold text-white">
                                {settings.name}
                            </div>
                        </div>
                        <div className="bg-white p-3 space-y-1.5">
                            <div className="flex items-center gap-2 rounded-lg px-2 py-1.5">
                                <div
                                    className="h-1.5 w-1.5 rounded-full"
                                    style={{ backgroundColor: brandColour }}
                                />
                                <span className="text-xs font-medium" style={{ color: brandColour }}>
                                    Dashboard
                                </span>
                            </div>
                            <div className="flex items-center gap-2 rounded-lg px-2 py-1.5">
                                <div className="h-1.5 w-1.5 rounded-full bg-gray-300" />
                                <span className="text-xs text-gray-500">Time off</span>
                            </div>
                            <div className="flex items-center gap-2 rounded-lg px-2 py-1.5">
                                <div className="h-1.5 w-1.5 rounded-full bg-gray-300" />
                                <span className="text-xs text-gray-500">Approvals</span>
                            </div>
                            <div className="flex items-center gap-2 rounded-lg px-2 py-1.5">
                                <div className="h-1.5 w-1.5 rounded-full bg-gray-300" />
                                <span className="text-xs text-gray-500">Team</span>
                            </div>
                        </div>
                        {/* Mock button */}
                        <div className="border-t border-gray-100 bg-gray-50 p-3">
                            <div
                                className="rounded-lg px-3 py-1.5 text-center text-xs font-medium text-white transition-colors duration-200"
                                style={{ backgroundColor: brandColour }}
                            >
                                Request time off
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="mt-6">
                <button onClick={handleSave} disabled={isPending} className="rounded-xl bg-primary px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:opacity-90 disabled:opacity-50">
                    {isPending ? 'Saving...' : 'Save branding'}
                </button>
            </div>
        </div>
    )
}

// ─── Danger zone ───

function DangerZoneSection({ orgName }: { orgName: string }) {
    const [isOpen, setIsOpen] = useState(false)
    const [confirmText, setConfirmText] = useState('')
    const confirmed = confirmText.trim().toLowerCase() === orgName.trim().toLowerCase()

    return (
        <div className="rounded-2xl border border-red-200 bg-white shadow-sm">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex w-full items-center justify-between p-6 text-left"
            >
                <div>
                    <h2 className="text-base font-medium text-red-600">Danger zone</h2>
                    <p className="mt-0.5 text-sm text-gray-500">
                        Irreversible actions for your organisation.
                    </p>
                </div>
                <span className="text-sm text-gray-400">
                    {isOpen ? 'Hide' : 'Show'}
                </span>
            </button>

            {isOpen && (
                <div className="border-t border-red-100 p-6">
                    <div className="rounded-xl border border-red-200 bg-red-50 p-4">
                        <h3 className="text-sm font-medium text-red-800">
                            Delete this organisation
                        </h3>
                        <p className="mt-1 text-sm text-red-600">
                            This will permanently delete your organisation, all team members,
                            leave records, and settings. This cannot be undone.
                        </p>
                        <div className="mt-4">
                            <label htmlFor="confirmDelete" className="mb-1 block text-xs font-medium text-red-700">
                                Type &ldquo;{orgName}&rdquo; to confirm
                            </label>
                            <input
                                id="confirmDelete"
                                type="text"
                                value={confirmText}
                                onChange={(e) => setConfirmText(e.target.value)}
                                className="block w-full rounded-xl border border-red-300 bg-white px-3 py-2 text-sm outline-none focus:border-red-500"
                                placeholder={orgName}
                            />
                        </div>
                        <button
                            disabled={!confirmed}
                            className="mt-4 rounded-xl bg-red-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed"
                            onClick={() => alert('Organisation deletion is not yet implemented. This will be available in a future update.')}
                        >
                            Delete organisation permanently
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}
