'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import Segment from '@/components/ui/Segment'
import { FormItem } from '@/components/ui/Form'
import type { OrgSettings } from '@/server/actions/org/getOrgSettings'

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

interface OrganisationTabProps {
    settings: OrgSettings
}

export default function OrganisationTab({ settings }: OrganisationTabProps) {
    const router = useRouter()
    const [name, setName] = useState(settings.name)
    const [sector, setSector] = useState(settings.sector)
    const [size, setSize] = useState(settings.size)
    const [isPending, setIsPending] = useState(false)
    const [message, setMessage] = useState<{
        type: 'success' | 'error'
        text: string
    } | null>(null)

    const sectorOptions = SECTORS.map((s) => ({ value: s, label: s }))

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
                setMessage({
                    type: 'success',
                    text: 'Organisation details saved.',
                })
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
                <h5>Organisation details</h5>
                <p className="mt-1 text-sm text-gray-500">
                    Basic information about your organisation.
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

                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                    <div className="sm:col-span-2">
                        <FormItem label="Organisation name">
                            <Input
                                type="text"
                                value={name}
                                onChange={(e) =>
                                    setName(
                                        (e.target as HTMLInputElement).value,
                                    )
                                }
                            />
                        </FormItem>
                    </div>
                    <FormItem label="Sector">
                        <Select
                            options={sectorOptions}
                            value={sectorOptions.find(
                                (o) => o.value === sector,
                            )}
                            onChange={(opt) =>
                                setSector(
                                    (opt as { value: string })?.value ?? '',
                                )
                            }
                            placeholder="Select sector"
                        />
                    </FormItem>
                    <FormItem label="Team size">
                        <Segment
                            value={[size]}
                            onChange={(val) => {
                                const v = Array.isArray(val) ? val[0] : val
                                setSize(v)
                            }}
                            size="sm"
                        >
                            {ORG_SIZES.map((s) => (
                                <Segment.Item key={s} value={s}>
                                    {s}
                                </Segment.Item>
                            ))}
                        </Segment>
                    </FormItem>
                </div>

                <div className="mt-6">
                    <Button
                        variant="solid"
                        onClick={handleSave}
                        loading={isPending}
                    >
                        Save details
                    </Button>
                </div>
            </Card>

            {/* Danger zone */}
            <DangerZoneSection orgName={settings.name} />
        </div>
    )
}

function DangerZoneSection({ orgName }: { orgName: string }) {
    const [isOpen, setIsOpen] = useState(false)
    const [confirmText, setConfirmText] = useState('')
    const confirmed =
        confirmText.trim().toLowerCase() === orgName.trim().toLowerCase()

    return (
        <Card
            className="border-red-200 dark:border-red-500/30"
            clickable
            onClick={() => setIsOpen(!isOpen)}
        >
            <div className="flex items-center justify-between">
                <div>
                    <h5 className="text-red-600">Danger zone</h5>
                    <p className="mt-0.5 text-sm text-gray-500">
                        Irreversible actions for your organisation.
                    </p>
                </div>
                <span className="text-sm text-gray-400">
                    {isOpen ? 'Hide' : 'Show'}
                </span>
            </div>

            {isOpen && (
                <div
                    className="mt-4 rounded-lg border border-red-200 bg-red-50 dark:bg-red-500/10 p-4"
                    onClick={(e) => e.stopPropagation()}
                >
                    <h6 className="text-sm font-medium text-red-800 dark:text-red-400">
                        Delete this organisation
                    </h6>
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                        This will permanently delete your organisation, all team
                        members, leave records, and settings. This cannot be
                        undone.
                    </p>
                    <div className="mt-4">
                        <FormItem
                            label={`Type "${orgName}" to confirm`}
                            labelClass="text-xs text-red-700"
                        >
                            <Input
                                type="text"
                                value={confirmText}
                                onChange={(e) =>
                                    setConfirmText(
                                        (e.target as HTMLInputElement).value,
                                    )
                                }
                                placeholder={orgName}
                            />
                        </FormItem>
                    </div>
                    <Button
                        variant="solid"
                        className="mt-4 bg-red-600 hover:bg-red-700"
                        disabled={!confirmed}
                        onClick={() =>
                            alert(
                                'Organisation deletion is not yet implemented. This will be available in a future update.',
                            )
                        }
                    >
                        Delete organisation permanently
                    </Button>
                </div>
            )}
        </Card>
    )
}
