'use client'

import React, { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import type { ApprovalRequestRow } from '@/server/actions/hr/getLeaveRequestsForApproval'
import {
    approveLeaveRequest,
    type ApprovalAction,
} from '@/server/actions/hr/approveLeaveRequest'

interface LeaveApprovalsViewProps {
    requests: ApprovalRequestRow[]
    userId: string
}

export default function LeaveApprovalsView({
    requests,
    userId,
}: LeaveApprovalsViewProps) {
    const [confirmation, setConfirmation] = useState<{
        request: ApprovalRequestRow
        action: ApprovalAction
    } | null>(null)

    const isEmpty = requests.length === 0

    return (
        <>
            <div className="space-y-6 p-6">
                <div>
                    <h1 className="text-2xl font-semibold">Leave Approvals</h1>
                    <p className="text-sm text-gray-500">
                        Requests waiting for your decision
                    </p>
                </div>

                {isEmpty ? (
                    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                        <p className="text-gray-500">
                            No requests waiting for approval.
                        </p>
                    </div>
                ) : (
                    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
                        <div className="border-b border-gray-200 p-4">
                            <h2 className="text-lg font-medium">
                                Pending requests ({requests.length})
                            </h2>
                        </div>

                        {/* Desktop table */}
                        <div className="hidden overflow-x-auto md:block">
                            <table className="min-w-full text-left text-sm">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-3 font-medium">Employee</th>
                                        <th className="px-4 py-3 font-medium">Leave type</th>
                                        <th className="px-4 py-3 font-medium">Dates</th>
                                        <th className="px-4 py-3 font-medium">Duration</th>
                                        <th className="px-4 py-3 font-medium">Reason</th>
                                        <th className="px-4 py-3 font-medium">Submitted</th>
                                        <th className="px-4 py-3 font-medium text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {requests.map((r) => (
                                        <tr
                                            key={r.id}
                                            className="border-t border-gray-100"
                                        >
                                            <td className="px-4 py-3 font-medium">
                                                {r.employeeName}
                                            </td>
                                            <td className="px-4 py-3">{r.leaveType}</td>
                                            <td className="px-4 py-3">{r.dates}</td>
                                            <td className="px-4 py-3">
                                                {r.days} day{r.days !== 1 ? 's' : ''}
                                            </td>
                                            <td className="px-4 py-3 max-w-[200px] truncate text-gray-500">
                                                {r.reason || '—'}
                                            </td>
                                            <td className="px-4 py-3">{r.submittedAt}</td>
                                            <td className="px-4 py-3">
                                                <div className="flex justify-end gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            setConfirmation({
                                                                request: r,
                                                                action: 'approve',
                                                            })
                                                        }
                                                        className="rounded-lg border border-emerald-300 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700 transition hover:bg-emerald-100"
                                                    >
                                                        Approve
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            setConfirmation({
                                                                request: r,
                                                                action: 'decline',
                                                            })
                                                        }
                                                        className="rounded-lg border border-red-300 bg-red-50 px-3 py-1 text-xs font-medium text-red-700 transition hover:bg-red-100"
                                                    >
                                                        Decline
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile card view */}
                        <div className="block p-4 md:hidden">
                            <div className="space-y-3">
                                {requests.map((r) => (
                                    <div
                                        key={r.id}
                                        className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
                                    >
                                        <div className="font-medium">
                                            {r.employeeName}
                                        </div>
                                        <div className="mt-1 text-sm text-gray-500">
                                            {r.leaveType} — {r.days} day
                                            {r.days !== 1 ? 's' : ''}
                                        </div>
                                        <div className="mt-1 text-sm text-gray-500">
                                            {r.dates}
                                        </div>
                                        {r.reason && (
                                            <div className="mt-1 text-sm text-gray-400">
                                                {r.reason}
                                            </div>
                                        )}
                                        <div className="mt-3 flex gap-2">
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setConfirmation({
                                                        request: r,
                                                        action: 'approve',
                                                    })
                                                }
                                                className="flex-1 rounded-lg border border-emerald-300 bg-emerald-50 px-3 py-1.5 text-sm font-medium text-emerald-700 transition hover:bg-emerald-100"
                                            >
                                                Approve
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setConfirmation({
                                                        request: r,
                                                        action: 'decline',
                                                    })
                                                }
                                                className="flex-1 rounded-lg border border-red-300 bg-red-50 px-3 py-1.5 text-sm font-medium text-red-700 transition hover:bg-red-100"
                                            >
                                                Decline
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {confirmation && (
                <ConfirmationDialog
                    request={confirmation.request}
                    action={confirmation.action}
                    approverId={userId}
                    onClose={() => setConfirmation(null)}
                />
            )}
        </>
    )
}

function ConfirmationDialog({
    request,
    action,
    approverId,
    onClose,
}: {
    request: ApprovalRequestRow
    action: ApprovalAction
    approverId: string
    onClose: () => void
}) {
    const router = useRouter()
    const [isPending, startTransition] = useTransition()
    const [note, setNote] = useState('')
    const [error, setError] = useState<string | null>(null)

    const isApprove = action === 'approve'
    const daysLabel = `${request.days} day${request.days !== 1 ? 's' : ''}`

    const handleConfirm = () => {
        setError(null)

        startTransition(async () => {
            const result = await approveLeaveRequest({
                requestId: request.id,
                approverId,
                action,
                note: action === 'decline' ? note : undefined,
            })

            if (!result.success) {
                setError(result.error ?? 'Something went wrong. Please try again.')
                return
            }

            onClose()
            router.refresh()
        })
    }

    const inputClass =
        'block w-full rounded-xl border border-gray-300 px-3 py-2 text-sm shadow-sm outline-none focus:border-primary'

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white shadow-xl">
                <div className="border-b border-gray-200 px-6 py-4">
                    <h3 className="text-lg font-semibold">
                        {isApprove ? 'Approve time off' : 'Decline time off'}
                    </h3>
                </div>

                <div className="space-y-4 px-6 py-5">
                    {error && (
                        <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                            {error}
                        </div>
                    )}

                    {/* Confirmation summary */}
                    <div className="rounded-xl bg-gray-50 p-4 text-sm">
                        <p className="text-gray-900">
                            {isApprove ? 'Approve' : 'Decline'}{' '}
                            <span className="font-semibold">
                                {daysLabel} {request.leaveType.toLowerCase()}
                            </span>{' '}
                            for{' '}
                            <span className="font-semibold">
                                {request.employeeName}
                            </span>
                            ?
                        </p>
                        <p className="mt-1 text-gray-500">{request.dates}</p>
                        {request.reason && (
                            <p className="mt-1 text-gray-400">
                                Reason: {request.reason}
                            </p>
                        )}
                    </div>

                    {/* Decline note — only shown when declining */}
                    {!isApprove && (
                        <div>
                            <label
                                htmlFor="declineNote"
                                className="mb-1 block text-sm font-medium text-gray-700"
                            >
                                Reason for declining (optional)
                            </label>
                            <textarea
                                id="declineNote"
                                value={note}
                                onChange={(e) => setNote(e.target.value)}
                                rows={2}
                                className={inputClass}
                                placeholder="Let them know why"
                                disabled={isPending}
                            />
                        </div>
                    )}

                    <div className="flex items-center justify-end gap-3 pt-1">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isPending}
                            className="rounded-xl border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            onClick={handleConfirm}
                            disabled={isPending}
                            className={`rounded-xl px-4 py-2 text-sm font-medium text-white shadow-sm transition disabled:opacity-50 ${
                                isApprove
                                    ? 'bg-emerald-600 hover:bg-emerald-700'
                                    : 'bg-red-600 hover:bg-red-700'
                            }`}
                        >
                            {isPending
                                ? 'Processing…'
                                : isApprove
                                  ? 'Confirm approval'
                                  : 'Confirm decline'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
