'use client'

import React, { useState } from 'react'

interface ActionConfirmFormProps {
    token: string
    action: 'approve' | 'decline'
    employeeName: string
    leaveType: string
    dateRange: string
    days: number
    reason?: string
}

export default function ActionConfirmForm({
    token,
    action,
    employeeName,
    leaveType,
    dateRange,
    days,
    reason,
}: ActionConfirmFormProps) {
    const [isPending, setIsPending] = useState(false)
    const [comment, setComment] = useState('')
    const [error, setError] = useState<string | null>(null)
    const [done, setDone] = useState(false)

    const isApprove = action === 'approve'
    const daysLabel = `${days} day${days !== 1 ? 's' : ''}`

    const handleConfirm = async () => {
        setError(null)
        setIsPending(true)

        try {
            const response = await fetch('/api/leave/action', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    token,
                    action,
                    comment: comment.trim() || undefined,
                }),
            })

            const result = await response.json()

            if (!result.success) {
                setError(result.error ?? 'Something went wrong. Please try again.')
                return
            }

            setDone(true)
            setTimeout(() => {
                window.location.href = '/sign-in'
            }, 3000)
        } catch {
            setError('Something went wrong. Please check your connection and try again.')
        } finally {
            setIsPending(false)
        }
    }

    if (done) {
        return (
            <div className="orgcentral-brand flex min-h-screen items-center justify-center bg-gray-50 p-4">
                <div className="w-full max-w-md text-center">
                    <div className="mb-4 text-lg font-bold" style={{ color: '#0066CC' }}>
                        OrgCentral
                    </div>
                    <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
                        <div className="mb-2 text-3xl">{isApprove ? '✅' : '❌'}</div>
                        <h1 className="text-xl font-semibold text-gray-900">
                            Done
                        </h1>
                        <p className="mt-2 text-sm text-gray-500">
                            {employeeName} has been notified that their time off was{' '}
                            {isApprove ? 'approved' : 'declined'}.
                        </p>
                        <p className="mt-4 text-xs text-gray-400">
                            Redirecting to OrgCentral...
                        </p>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="orgcentral-brand flex min-h-screen items-center justify-center bg-gray-50 p-4">
            <div className="w-full max-w-md">
                <div className="mb-6 text-center">
                    <div className="text-lg font-bold" style={{ color: '#0066CC' }}>
                        OrgCentral
                    </div>
                </div>

                <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
                    <h1 className="text-xl font-semibold text-gray-900">
                        {isApprove ? 'Approve' : 'Decline'} time off
                    </h1>
                    <p className="mt-2 text-sm text-gray-500">
                        You are {isApprove ? 'approving' : 'declining'}{' '}
                        <strong>{daysLabel}</strong> of{' '}
                        <strong>{leaveType.toLowerCase()}</strong> for{' '}
                        <strong>{employeeName}</strong>.
                    </p>

                    {/* Summary */}
                    <div className="mt-5 rounded-xl bg-gray-50 p-4 text-sm">
                        <div className="space-y-1.5">
                            <div className="flex justify-between">
                                <span className="text-gray-400">Dates</span>
                                <span className="text-gray-700">{dateRange}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-400">Duration</span>
                                <span className="text-gray-700">{daysLabel}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-400">Type</span>
                                <span className="text-gray-700">{leaveType}</span>
                            </div>
                            {reason && (
                                <div className="flex justify-between">
                                    <span className="text-gray-400">Reason</span>
                                    <span className="text-gray-700">{reason}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {error && (
                        <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                            {error}
                        </div>
                    )}

                    {/* Optional comment */}
                    <div className="mt-5">
                        <label
                            htmlFor="comment"
                            className="mb-1 block text-sm font-medium text-gray-700"
                        >
                            Add a note (optional)
                        </label>
                        <textarea
                            id="comment"
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            rows={2}
                            disabled={isPending}
                            className="block w-full rounded-xl border border-gray-300 px-3 py-2 text-sm shadow-sm outline-none focus:border-primary"
                            placeholder={isApprove ? 'e.g. Enjoy your break!' : 'e.g. We need cover that week'}
                        />
                    </div>

                    <button
                        type="button"
                        onClick={handleConfirm}
                        disabled={isPending}
                        className={`mt-6 w-full rounded-xl px-4 py-2.5 text-sm font-medium text-white shadow-sm transition disabled:opacity-50 ${
                            isApprove
                                ? 'bg-[#0066CC] hover:bg-[#0055aa]'
                                : 'bg-red-600 hover:bg-red-700'
                        }`}
                    >
                        {isPending
                            ? 'Processing...'
                            : isApprove
                              ? 'Confirm approval'
                              : 'Confirm decline'}
                    </button>
                </div>
            </div>
        </div>
    )
}
