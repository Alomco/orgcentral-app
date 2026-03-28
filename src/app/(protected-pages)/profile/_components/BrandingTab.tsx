'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { FormItem } from '@/components/ui/Form'
import type { OrgSettings } from '@/server/actions/org/getOrgSettings'

interface BrandingTabProps {
    settings: OrgSettings
}

export default function BrandingTab({ settings }: BrandingTabProps) {
    const router = useRouter()
    const [brandColour, setBrandColour] = useState(settings.brandColour)
    const [logoUrl, setLogoUrl] = useState(settings.logoUrl)
    const [isPending, setIsPending] = useState(false)
    const [message, setMessage] = useState<{
        type: 'success' | 'error'
        text: string
    } | null>(null)

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
                setMessage({
                    type: 'error',
                    text: result.error ?? 'Something went wrong.',
                })
            }
        } catch {
            setMessage({
                type: 'error',
                text: 'Something went wrong. Please try again.',
            })
        } finally {
            setIsPending(false)
        }
    }

    return (
        <Card>
            <h5>Branding</h5>
            <p className="mt-1 text-sm text-gray-500">
                Customise how OrgCentral looks for your team. Changes apply to
                all members.
            </p>

            {message && (
                <div
                    className={`mt-4 rounded-lg border p-3 text-sm ${
                        message.type === 'success'
                            ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                            : 'border-red-200 bg-red-50 text-red-700'
                    }`}
                >
                    {message.text}
                </div>
            )}

            <div className="mt-5 grid gap-6 lg:grid-cols-2">
                {/* Controls */}
                <div className="flex flex-col gap-4">
                    <FormItem label="Brand colour">
                        <div className="flex items-center gap-3">
                            <input
                                type="color"
                                value={brandColour}
                                onChange={(e) =>
                                    setBrandColour(e.target.value)
                                }
                                className="h-10 w-14 cursor-pointer rounded-lg border border-gray-300 dark:border-gray-600"
                            />
                            <Input
                                type="text"
                                value={brandColour}
                                onChange={(e) =>
                                    setBrandColour(
                                        (e.target as HTMLInputElement).value,
                                    )
                                }
                                placeholder="#0066CC"
                                maxLength={7}
                            />
                        </div>
                        <p className="mt-1 text-xs text-gray-400">
                            Used for buttons, active states, and accents
                            throughout the app.
                        </p>
                    </FormItem>
                    <FormItem label="Logo URL (optional)">
                        <Input
                            type="url"
                            value={logoUrl}
                            onChange={(e) =>
                                setLogoUrl(
                                    (e.target as HTMLInputElement).value,
                                )
                            }
                            placeholder="https://example.com/logo.png"
                        />
                        <p className="mt-1 text-xs text-gray-400">
                            Image upload coming soon. For now, paste a URL to
                            your logo.
                        </p>
                    </FormItem>
                </div>

                {/* Live preview */}
                <div>
                    <div className="mb-2 text-xs font-medium uppercase tracking-wide text-gray-400">
                        Live preview
                    </div>
                    <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-600 shadow-sm">
                        {/* Mini sidebar mockup */}
                        <div
                            className="p-4 transition-colors duration-200"
                            style={{ backgroundColor: brandColour }}
                        >
                            <div className="text-sm font-bold text-white">
                                {settings.name}
                            </div>
                        </div>
                        <div className="bg-white dark:bg-gray-800 p-3 space-y-1.5">
                            <div className="flex items-center gap-2 rounded-lg px-2 py-1.5">
                                <div
                                    className="h-1.5 w-1.5 rounded-full"
                                    style={{ backgroundColor: brandColour }}
                                />
                                <span
                                    className="text-xs font-medium"
                                    style={{ color: brandColour }}
                                >
                                    Dashboard
                                </span>
                            </div>
                            <div className="flex items-center gap-2 rounded-lg px-2 py-1.5">
                                <div className="h-1.5 w-1.5 rounded-full bg-gray-300" />
                                <span className="text-xs text-gray-500">
                                    Time off
                                </span>
                            </div>
                            <div className="flex items-center gap-2 rounded-lg px-2 py-1.5">
                                <div className="h-1.5 w-1.5 rounded-full bg-gray-300" />
                                <span className="text-xs text-gray-500">
                                    Approvals
                                </span>
                            </div>
                            <div className="flex items-center gap-2 rounded-lg px-2 py-1.5">
                                <div className="h-1.5 w-1.5 rounded-full bg-gray-300" />
                                <span className="text-xs text-gray-500">
                                    Team
                                </span>
                            </div>
                        </div>
                        {/* Mock button */}
                        <div className="border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-3">
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
                <Button
                    variant="solid"
                    onClick={handleSave}
                    loading={isPending}
                >
                    Save branding
                </Button>
            </div>
        </Card>
    )
}
