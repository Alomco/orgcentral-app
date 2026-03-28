'use client'

import { useState } from 'react'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { FormItem } from '@/components/ui/Form'
import PasswordInput from '@/components/shared/PasswordInput'

export default function SecurityTab() {
    const [currentPassword, setCurrentPassword] = useState('')
    const [newPassword, setNewPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [isPending, setIsPending] = useState(false)
    const [message, setMessage] = useState<{
        type: 'success' | 'error'
        text: string
    } | null>(null)

    const handleChangePassword = async () => {
        setMessage(null)

        if (newPassword.length < 8) {
            setMessage({
                type: 'error',
                text: 'New password must be at least 8 characters.',
            })
            return
        }
        if (newPassword !== confirmPassword) {
            setMessage({
                type: 'error',
                text: 'New passwords do not match.',
            })
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
            <h5>Change password</h5>

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

            <div className="mt-5 flex flex-col gap-4">
                <FormItem label="Current password">
                    <PasswordInput
                        value={currentPassword}
                        onChange={(e) =>
                            setCurrentPassword(
                                (e.target as HTMLInputElement).value,
                            )
                        }
                    />
                </FormItem>
                <div className="grid gap-4 sm:grid-cols-2">
                    <FormItem label="New password">
                        <PasswordInput
                            value={newPassword}
                            onChange={(e) =>
                                setNewPassword(
                                    (e.target as HTMLInputElement).value,
                                )
                            }
                            placeholder="At least 8 characters"
                        />
                    </FormItem>
                    <FormItem label="Confirm new password">
                        <PasswordInput
                            value={confirmPassword}
                            onChange={(e) =>
                                setConfirmPassword(
                                    (e.target as HTMLInputElement).value,
                                )
                            }
                        />
                    </FormItem>
                </div>
            </div>

            <div className="mt-6">
                <Button
                    variant="solid"
                    onClick={handleChangePassword}
                    loading={isPending}
                    disabled={
                        !currentPassword || !newPassword || !confirmPassword
                    }
                >
                    Update password
                </Button>
            </div>
        </Card>
    )
}
