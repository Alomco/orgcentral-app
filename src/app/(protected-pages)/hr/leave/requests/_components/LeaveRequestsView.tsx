'use client'

import React, { useMemo, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import type { LeaveRequestRow, LeaveRequestSummary } from '@/server/actions/hr/getLeaveRequests'
import type { LeavePolicyOption } from '@/server/actions/hr/getLeavePolicies'
import {
    submitLeaveRequest,
    type DurationType,
    type HalfDayPortion,
} from '@/server/actions/hr/submitLeaveRequest'
import { countWorkingDays } from '@/server/actions/hr/leaveUtils'

interface LeaveRequestsViewProps {
    initialRequests: LeaveRequestRow[]
    summary: LeaveRequestSummary
    policies: LeavePolicyOption[]
    userId: string
}

function getStatusBadgeClass(status: LeaveRequestRow['status']) {
    switch (status) {
        case 'Approved':
            return 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200'
        case 'Rejected':
            return 'bg-red-50 text-red-700 ring-1 ring-red-200'
        case 'Cancelled':
            return 'bg-gray-100 text-gray-700 ring-1 ring-gray-200'
        default:
            return 'bg-amber-50 text-amber-700 ring-1 ring-amber-200'
    }
}

const summaryLabels: { key: keyof LeaveRequestSummary; label: string }[] = [
    { key: 'total', label: 'Total' },
    { key: 'pending', label: 'Pending' },
    { key: 'approved', label: 'Approved' },
    { key: 'rejected', label: 'Rejected' },
    { key: 'cancelled', label: 'Cancelled' },
]

export default function LeaveRequestsView({
    initialRequests,
    summary,
    policies,
    userId,
}: LeaveRequestsViewProps) {
    const [isModalOpen, setIsModalOpen] = useState(false)
    const isEmpty = initialRequests.length === 0

    return (
        <>
            <div className="space-y-6 p-6">
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-semibold">HR Leave Requests</h1>
                        <p className="text-sm text-gray-500">
                            View and manage your leave requests.
                        </p>
                    </div>

                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="rounded-xl bg-primary px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:opacity-90"
                    >
                        Request Leave
                    </button>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
                    {summaryLabels.map((item) => (
                        <div
                            key={item.label}
                            className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm"
                        >
                            <div className="text-sm text-gray-500">{item.label}</div>
                            <div className="mt-2 text-2xl font-semibold">
                                {summary[item.key]}
                            </div>
                        </div>
                    ))}
                </div>

                {isEmpty ? (
                    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                        No leave requests found.
                    </div>
                ) : (
                    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
                        <div className="border-b border-gray-200 p-4">
                            <h2 className="text-lg font-medium">Requests</h2>
                        </div>

                        {/* Desktop table */}
                        <div className="hidden overflow-x-auto md:block">
                            <table className="min-w-full text-left text-sm">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-3 font-medium">Type</th>
                                        <th className="px-4 py-3 font-medium">Dates</th>
                                        <th className="px-4 py-3 font-medium">Days</th>
                                        <th className="px-4 py-3 font-medium">Status</th>
                                        <th className="px-4 py-3 font-medium">Evidence</th>
                                        <th className="px-4 py-3 font-medium">Submitted</th>
                                        <th className="px-4 py-3 font-medium">Approver / SLA</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {initialRequests.map((request) => (
                                        <tr
                                            key={request.id}
                                            className="border-t border-gray-100"
                                        >
                                            <td className="px-4 py-3">{request.type}</td>
                                            <td className="px-4 py-3">{request.dates}</td>
                                            <td className="px-4 py-3">{request.days}</td>
                                            <td className="px-4 py-3">
                                                <span
                                                    className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${getStatusBadgeClass(request.status)}`}
                                                >
                                                    {request.status}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                {request.evidence || '—'}
                                            </td>
                                            <td className="px-4 py-3">{request.submitted}</td>
                                            <td className="px-4 py-3">
                                                {request.approverSla}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile card view */}
                        <div className="block p-4 md:hidden">
                            <div className="space-y-3">
                                {initialRequests.map((request) => (
                                    <div
                                        key={request.id}
                                        className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="font-medium">
                                                {request.type}
                                            </div>
                                            <span
                                                className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${getStatusBadgeClass(request.status)}`}
                                            >
                                                {request.status}
                                            </span>
                                        </div>
                                        <div className="mt-2 space-y-1 text-sm text-gray-500">
                                            <div>{request.dates}</div>
                                            <div>
                                                {request.days} day
                                                {request.days !== 1 ? 's' : ''}
                                            </div>
                                            <div>Submitted: {request.submitted}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {isModalOpen && (
                <LeaveRequestModal
                    policies={policies}
                    userId={userId}
                    onClose={() => setIsModalOpen(false)}
                />
            )}
        </>
    )
}

const DURATION_OPTIONS: { value: DurationType; label: string }[] = [
    { value: 'full_day', label: 'Full day' },
    { value: 'half_day', label: 'Half day' },
    { value: 'hourly', label: 'Hourly' },
]

const HALF_DAY_OPTIONS: { value: HalfDayPortion; label: string }[] = [
    { value: 'first_half', label: 'First half' },
    { value: 'second_half', label: 'Second half' },
]

// 30-minute intervals from 00:00 to 23:30
const TIME_OPTIONS: string[] = Array.from({ length: 48 }, (_, i) => {
    const h = String(Math.floor(i / 2)).padStart(2, '0')
    const m = i % 2 === 0 ? '00' : '30'
    return `${h}:${m}`
})

function LeaveRequestModal({
    policies,
    userId,
    onClose,
}: {
    policies: LeavePolicyOption[]
    userId: string
    onClose: () => void
}) {
    const router = useRouter()
    const [isPending, startTransition] = useTransition()
    const [policyId, setPolicyId] = useState(policies[0]?.id ?? '')
    const [startDate, setStartDate] = useState('')
    const [endDate, setEndDate] = useState('')
    const [durationType, setDurationType] = useState<DurationType>('full_day')
    const [halfDayPortion, setHalfDayPortion] = useState<HalfDayPortion>('first_half')
    const [customHours, setCustomHours] = useState('')
    const [startTime, setStartTime] = useState('09:00')
    const [reason, setReason] = useState('')
    const [error, setError] = useState<string | null>(null)

    const isSingleDayOnly = durationType !== 'full_day'

    const handleDurationTypeChange = (value: DurationType) => {
        setDurationType(value)
        if (value !== 'full_day' && startDate) {
            setEndDate(startDate)
        }
    }

    const handleStartDateChange = (value: string) => {
        setStartDate(value)
        if (isSingleDayOnly) {
            setEndDate(value)
        }
    }

    // Live working-day calculation
    const calculatedDays = useMemo(() => {
        if (!startDate || (!endDate && !isSingleDayOnly)) return null
        const s = new Date(startDate)
        const e = isSingleDayOnly ? s : new Date(endDate)
        if (isNaN(s.getTime()) || isNaN(e.getTime()) || e < s) return null

        if (durationType === 'half_day') return 0.5
        if (durationType === 'hourly') {
            const h = parseFloat(customHours)
            return isNaN(h) || h <= 0 ? null : Math.round((h / 7.5) * 10) / 10
        }
        return countWorkingDays(s, e)
    }, [startDate, endDate, durationType, customHours, isSingleDayOnly])

    const durationLabel = useMemo(() => {
        if (calculatedDays === null) return null
        if (durationType === 'hourly') {
            const h = parseFloat(customHours)
            if (isNaN(h) || h <= 0) return null
            return `${h} hour${h !== 1 ? 's' : ''} from ${startTime} (${calculatedDays} day${calculatedDays !== 1 ? 's' : ''})`
        }
        if (durationType === 'half_day') {
            const label = halfDayPortion === 'first_half' ? 'first half' : 'second half'
            return `Half day (${label})`
        }
        return `${calculatedDays} working day${calculatedDays !== 1 ? 's' : ''}`
    }, [calculatedDays, durationType, customHours, startTime, halfDayPortion])

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setError(null)

        startTransition(async () => {
            const result = await submitLeaveRequest({
                userId,
                policyId,
                startDate,
                endDate: isSingleDayOnly ? startDate : endDate,
                durationType,
                halfDayPortion: durationType === 'half_day'
                    ? halfDayPortion
                    : undefined,
                customHours: durationType === 'hourly'
                    ? parseFloat(customHours)
                    : undefined,
                startTime: durationType === 'hourly'
                    ? startTime
                    : undefined,
                reason,
            })

            if (!result.success) {
                setError(result.error ?? 'Something went wrong.')
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
            <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl border border-gray-200 bg-white shadow-xl">
                <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
                    <div>
                        <h3 className="text-lg font-semibold">Request Leave</h3>
                        <p className="text-sm text-gray-500">
                            Complete the fields below to submit a new leave request.
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="rounded-lg px-2 py-1 text-xl text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                        aria-label="Close"
                    >
                        ×
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4 px-6 py-5">
                    <fieldset disabled={isPending} className="space-y-4">
                        {error && (
                            <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                                {error}
                            </div>
                        )}

                        {/* Leave type */}
                        <div>
                            <label
                                htmlFor="leaveType"
                                className="mb-1 block text-sm font-medium text-gray-700"
                            >
                                Leave type <span className="text-red-500">*</span>
                            </label>
                            <select
                                id="leaveType"
                                value={policyId}
                                onChange={(e) => setPolicyId(e.target.value)}
                                className={inputClass}
                                required
                            >
                                {policies.map((p) => (
                                    <option key={p.id} value={p.id}>
                                        {p.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Duration type */}
                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700">
                                Duration <span className="text-red-500">*</span>
                            </label>
                            <div className="flex gap-2">
                                {DURATION_OPTIONS.map((opt) => (
                                    <button
                                        key={opt.value}
                                        type="button"
                                        onClick={() =>
                                            handleDurationTypeChange(opt.value)
                                        }
                                        className={`rounded-xl border px-3 py-1.5 text-sm font-medium transition ${
                                            durationType === opt.value
                                                ? 'border-primary bg-primary/10 text-primary'
                                                : 'border-gray-300 text-gray-600 hover:bg-gray-50'
                                        }`}
                                    >
                                        {opt.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Half day portion selector */}
                        {durationType === 'half_day' && (
                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700">
                                    Which half? <span className="text-red-500">*</span>
                                </label>
                                <div className="flex gap-2">
                                    {HALF_DAY_OPTIONS.map((opt) => (
                                        <button
                                            key={opt.value}
                                            type="button"
                                            onClick={() =>
                                                setHalfDayPortion(opt.value)
                                            }
                                            className={`rounded-xl border px-3 py-1.5 text-sm font-medium transition ${
                                                halfDayPortion === opt.value
                                                    ? 'border-primary bg-primary/10 text-primary'
                                                    : 'border-gray-300 text-gray-600 hover:bg-gray-50'
                                            }`}
                                        >
                                            {opt.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Dates */}
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div>
                                <label
                                    htmlFor="startDate"
                                    className="mb-1 block text-sm font-medium text-gray-700"
                                >
                                    {isSingleDayOnly ? 'Date' : 'Start date'}{' '}
                                    <span className="text-red-500">*</span>
                                </label>
                                <input
                                    id="startDate"
                                    type="date"
                                    value={startDate}
                                    onChange={(e) =>
                                        handleStartDateChange(e.target.value)
                                    }
                                    className={inputClass}
                                    required
                                />
                            </div>
                            {!isSingleDayOnly && (
                                <div>
                                    <label
                                        htmlFor="endDate"
                                        className="mb-1 block text-sm font-medium text-gray-700"
                                    >
                                        End date{' '}
                                        <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        id="endDate"
                                        type="date"
                                        value={endDate}
                                        onChange={(e) =>
                                            setEndDate(e.target.value)
                                        }
                                        min={startDate || undefined}
                                        className={inputClass}
                                        required
                                    />
                                </div>
                            )}
                        </div>

                        {/* Hourly: hours input + start time dropdown */}
                        {durationType === 'hourly' && (
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div>
                                    <label
                                        htmlFor="customHours"
                                        className="mb-1 block text-sm font-medium text-gray-700"
                                    >
                                        Hours <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        id="customHours"
                                        type="number"
                                        min="0.5"
                                        max="7.5"
                                        step="0.5"
                                        value={customHours}
                                        onChange={(e) =>
                                            setCustomHours(e.target.value)
                                        }
                                        className={inputClass}
                                        placeholder="e.g. 2"
                                        required
                                    />
                                    <p className="mt-1 text-xs text-gray-400">
                                        Between 0.5 and 7.5 hours
                                    </p>
                                </div>
                                <div>
                                    <label
                                        htmlFor="startTime"
                                        className="mb-1 block text-sm font-medium text-gray-700"
                                    >
                                        Starting from <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        id="startTime"
                                        value={startTime}
                                        onChange={(e) =>
                                            setStartTime(e.target.value)
                                        }
                                        className={inputClass}
                                        required
                                    >
                                        {TIME_OPTIONS.map((t) => (
                                            <option key={t} value={t}>
                                                {t}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        )}

                        {/* Calculated duration display */}
                        {durationLabel && (
                            <div className="rounded-xl bg-gray-50 px-4 py-3">
                                <span className="text-sm text-gray-500">
                                    Time off:{' '}
                                </span>
                                <span className="text-sm font-semibold text-gray-900">
                                    {durationLabel}
                                </span>
                            </div>
                        )}

                        {/* Reason */}
                        <div>
                            <label
                                htmlFor="reason"
                                className="mb-1 block text-sm font-medium text-gray-700"
                            >
                                Reason (optional)
                            </label>
                            <textarea
                                id="reason"
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                rows={2}
                                className={inputClass}
                                placeholder="Add a short note for your approver"
                            />
                        </div>

                        {/* TODO: File upload field will be added in a later slice to replace
                            the removed text-based attachment note. This will use real file
                            storage (Azure Blob / S3) and create LeaveAttachment records. */}
                    </fieldset>

                    <div className="flex items-center justify-end gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isPending}
                            className="rounded-xl border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isPending}
                            className="rounded-xl bg-primary px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:opacity-90 disabled:opacity-50"
                        >
                            {isPending ? 'Submitting…' : 'Submit Request'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
