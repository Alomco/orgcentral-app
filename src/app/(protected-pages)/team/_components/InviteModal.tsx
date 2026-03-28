'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Dialog from '@/components/ui/Dialog'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Segment from '@/components/ui/Segment'
import { FormItem } from '@/components/ui/Form'

interface InviteModalProps {
    isOpen: boolean
    onClose: () => void
    userId: string
}

export default function InviteModal({
    isOpen,
    onClose,
    userId,
}: InviteModalProps) {
    const router = useRouter()
    const [isPending, setIsPending] = useState(false)
    const [email, setEmail] = useState('')
    const [name, setName] = useState('')
    const [role, setRole] = useState<'Staff' | 'Manager'>('Staff')
    const [error, setError] = useState<string | null>(null)
    const [step, setStep] = useState<'form' | 'confirm'>('form')

    const canProceed = email.trim().includes('@')

    const handleConfirmSend = async () => {
        setError(null)
        setIsPending(true)

        try {
            const response = await fetch('/api/team/invite', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    inviterUserId: userId,
                    email: email.trim(),
                    name: name.trim() || undefined,
                    role,
                }),
            })

            const result = await response.json()

            if (!result.success) {
                setError(result.error ?? 'Something went wrong.')
                setStep('form')
                return
            }

            onClose()
            router.refresh()
        } catch {
            setError('Something went wrong. Please try again.')
            setStep('form')
        } finally {
            setIsPending(false)
        }
    }

    const handleClose = () => {
        setStep('form')
        setEmail('')
        setName('')
        setRole('Staff')
        setError(null)
        onClose()
    }

    return (
        <Dialog
            isOpen={isOpen}
            onClose={handleClose}
            onRequestClose={handleClose}
            width={480}
        >
            <h4 className="mb-1">Invite someone</h4>
            <p className="text-sm text-gray-500 mb-6">
                {step === 'form'
                    ? "They\u2019ll get an email with a link to join."
                    : 'Check the details before sending.'}
            </p>

            {error && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 mb-4">
                    {error}
                </div>
            )}

            {step === 'form' ? (
                <div className="flex flex-col gap-4">
                    <FormItem label="Email address" asterisk>
                        <Input
                            type="email"
                            value={email}
                            onChange={(e) =>
                                setEmail((e.target as HTMLInputElement).value)
                            }
                            placeholder="colleague@example.com"
                            autoFocus
                        />
                    </FormItem>

                    <FormItem label="Name (optional)">
                        <Input
                            type="text"
                            value={name}
                            onChange={(e) =>
                                setName((e.target as HTMLInputElement).value)
                            }
                            placeholder="e.g. Sarah Johnson"
                        />
                    </FormItem>

                    <FormItem label="Role">
                        <Segment
                            value={[role]}
                            onChange={(val) => {
                                const v = Array.isArray(val) ? val[0] : val
                                setRole(v as 'Staff' | 'Manager')
                            }}
                            size="sm"
                        >
                            <Segment.Item value="Staff">Staff</Segment.Item>
                            <Segment.Item value="Manager">Manager</Segment.Item>
                        </Segment>
                    </FormItem>

                    <div className="flex justify-end gap-2 pt-2">
                        <Button onClick={handleClose}>Cancel</Button>
                        <Button
                            variant="solid"
                            onClick={() => setStep('confirm')}
                            disabled={!canProceed}
                        >
                            Review invitation
                        </Button>
                    </div>
                </div>
            ) : (
                <div className="flex flex-col gap-4">
                    {/* Confirmation summary */}
                    <div className="rounded-lg bg-gray-50 dark:bg-gray-700 p-4 text-sm">
                        <p className="heading-text">
                            Send an invitation to{' '}
                            <span className="font-semibold">{email}</span>
                            {name && ` (${name})`}
                            {' '}as a <span className="font-semibold">{role}</span>?
                        </p>
                        <p className="mt-1 text-gray-500">
                            They'll receive an email with a link to create their account.
                        </p>
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                        <Button
                            onClick={() => setStep('form')}
                            disabled={isPending}
                        >
                            Back
                        </Button>
                        <Button
                            variant="solid"
                            onClick={handleConfirmSend}
                            loading={isPending}
                        >
                            Send invitation
                        </Button>
                    </div>
                </div>
            )}
        </Dialog>
    )
}
