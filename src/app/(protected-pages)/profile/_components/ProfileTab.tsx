'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { FormItem } from '@/components/ui/Form'
import type { ProfileData } from '@/server/actions/profile/getProfileData'

interface ProfileTabProps {
    profile: ProfileData
}

export default function ProfileTab({ profile }: ProfileTabProps) {
    const router = useRouter()
    const [firstName, setFirstName] = useState(profile.firstName)
    const [lastName, setLastName] = useState(profile.lastName)
    const [jobTitle, setJobTitle] = useState(profile.jobTitle)
    const [phone, setPhone] = useState(profile.phone)
    const [isPending, setIsPending] = useState(false)
    const [message, setMessage] = useState<{
        type: 'success' | 'error'
        text: string
    } | null>(null)

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
        <div className="flex flex-col gap-6">
            <Card>
                <h5>Personal details</h5>

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

                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                    <FormItem label="First name">
                        <Input
                            type="text"
                            value={firstName}
                            onChange={(e) =>
                                setFirstName(
                                    (e.target as HTMLInputElement).value,
                                )
                            }
                        />
                    </FormItem>
                    <FormItem label="Last name">
                        <Input
                            type="text"
                            value={lastName}
                            onChange={(e) =>
                                setLastName(
                                    (e.target as HTMLInputElement).value,
                                )
                            }
                        />
                    </FormItem>
                    <FormItem label="Email">
                        <Input
                            type="email"
                            value={profile.email}
                            disabled
                        />
                    </FormItem>
                    <FormItem label="Job title">
                        <Input
                            type="text"
                            value={jobTitle}
                            onChange={(e) =>
                                setJobTitle(
                                    (e.target as HTMLInputElement).value,
                                )
                            }
                            placeholder="e.g. Practice Manager"
                        />
                    </FormItem>
                    <div className="sm:col-span-2">
                        <FormItem label="Phone number (optional)">
                            <Input
                                type="tel"
                                value={phone}
                                onChange={(e) =>
                                    setPhone(
                                        (e.target as HTMLInputElement).value,
                                    )
                                }
                                placeholder="e.g. 07700 900000"
                            />
                        </FormItem>
                    </div>
                </div>

                <div className="mt-6">
                    <Button
                        variant="solid"
                        onClick={handleSave}
                        loading={isPending}
                    >
                        Save changes
                    </Button>
                </div>
            </Card>

            {/* Organisation info (read-only) */}
            <Card>
                <h5>Your organisation</h5>
                <div className="mt-5 grid gap-4 sm:grid-cols-3">
                    <div>
                        <div className="text-xs text-gray-400">Organisation</div>
                        <div className="mt-1 text-sm font-medium heading-text">
                            {profile.orgName}
                        </div>
                    </div>
                    <div>
                        <div className="text-xs text-gray-400">Your role</div>
                        <div className="mt-1 text-sm font-medium heading-text">
                            {profile.roleName}
                        </div>
                    </div>
                    <div>
                        <div className="text-xs text-gray-400">Member since</div>
                        <div className="mt-1 text-sm font-medium heading-text">
                            {profile.memberSince}
                        </div>
                    </div>
                </div>
            </Card>
        </div>
    )
}
