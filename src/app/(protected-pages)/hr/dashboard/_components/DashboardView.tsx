'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import type { DashboardStats } from '@/server/actions/dashboard/getDashboardStats'
import type { UpcomingLeaveRow } from '@/server/actions/dashboard/getUpcomingLeave'
import type { PendingSnapshotRow } from '@/server/actions/dashboard/getPendingApprovalsSnapshot'

interface DashboardViewProps {
    stats: DashboardStats
    upcoming: UpcomingLeaveRow[]
    pendingSnapshot: PendingSnapshotRow[]
    userId: string
}

function getGreeting(): string {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 17) return 'Good afternoon'
    return 'Good evening'
}

function formatToday(): string {
    return new Date().toLocaleDateString('en-GB', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    })
}

export default function DashboardView({
    stats,
    upcoming,
    pendingSnapshot,
    userId,
}: DashboardViewProps) {
    return (
        <div className="space-y-6 p-6">
            {/* 1. Welcome header */}
            <div>
                <h1 className="text-2xl font-semibold text-gray-900">
                    {getGreeting()}, {stats.firstName}
                </h1>
                <p className="mt-1 text-sm text-gray-500">
                    {formatToday()} · {stats.orgName}
                </p>
            </div>

            {/* 2. Summary cards */}
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                <StatCard label="Total staff" value={stats.totalStaff} />
                <StatCard label="Off today" value={stats.offToday} />
                <StatCard
                    label="Pending approvals"
                    value={stats.pendingApprovals}
                    href="/hr/leave/approvals"
                    highlight={stats.pendingApprovals > 0}
                />
                <StatCard label="Requests this month" value={stats.requestsThisMonth} />
            </div>

            {/* 3 + 4. Two-column: upcoming leave + pending approvals */}
            <div className="grid gap-6 lg:grid-cols-2">
                {/* Upcoming leave */}
                <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
                    <div className="flex items-center justify-between border-b border-gray-200 p-4">
                        <h2 className="text-base font-medium">Upcoming leave</h2>
                        <Link href="/hr/leave/requests" className="text-xs text-primary hover:underline">
                            View all
                        </Link>
                    </div>
                    {upcoming.length === 0 ? (
                        <div className="p-6 text-center text-sm text-gray-400">
                            No upcoming approved leave
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-100">
                            {upcoming.map((row) => (
                                <div key={row.id} className="flex items-center justify-between px-4 py-3">
                                    <div>
                                        <div className="text-sm font-medium text-gray-900">
                                            {row.employeeName}
                                        </div>
                                        <div className="text-xs text-gray-500">
                                            {row.leaveType} · {row.dates}
                                        </div>
                                    </div>
                                    <div className="text-xs font-medium text-gray-500">
                                        {row.days} day{row.days !== 1 ? 's' : ''}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Pending approvals snapshot */}
                <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
                    <div className="flex items-center justify-between border-b border-gray-200 p-4">
                        <h2 className="text-base font-medium">Needs your attention</h2>
                        {pendingSnapshot.length > 0 && (
                            <Link href="/hr/leave/approvals" className="text-xs text-primary hover:underline">
                                View all
                            </Link>
                        )}
                    </div>
                    {pendingSnapshot.length === 0 ? (
                        <div className="p-6 text-center text-sm text-gray-400">
                            No requests waiting for approval
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-100">
                            {pendingSnapshot.map((row) => (
                                <PendingRow key={row.id} row={row} userId={userId} />
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* 5. Quick actions */}
            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                <h2 className="mb-4 text-base font-medium">Quick actions</h2>
                <div className="flex flex-wrap gap-3">
                    {stats.pendingApprovals > 0 && (
                        <QuickAction href="/hr/leave/approvals" label="Approve pending requests" />
                    )}
                    <QuickAction href="/hr/leave/requests" label="Request time off" />
                    <QuickAction href="/team" label="Invite a team member" />
                    <QuickAction href="/team" label="View your team" />
                </div>
            </div>
        </div>
    )
}

function StatCard({
    label,
    value,
    href,
    highlight,
}: {
    label: string
    value: number
    href?: string
    highlight?: boolean
}) {
    const content = (
        <div
            className={`rounded-2xl border bg-white p-5 shadow-sm transition ${
                highlight
                    ? 'border-amber-200 bg-amber-50/50'
                    : 'border-gray-200'
            } ${href ? 'hover:shadow-md cursor-pointer' : ''}`}
        >
            <div className="text-sm text-gray-500">{label}</div>
            <div className={`mt-1 text-3xl font-bold ${highlight ? 'text-amber-600' : 'text-gray-900'}`}>
                {value}
            </div>
        </div>
    )

    if (href) {
        return <Link href={href}>{content}</Link>
    }
    return content
}

function QuickAction({ href, label }: { href: string; label: string }) {
    return (
        <Link
            href={href}
            className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 hover:shadow-sm"
        >
            {label}
        </Link>
    )
}

function PendingRow({ row, userId }: { row: PendingSnapshotRow; userId: string }) {
    const router = useRouter()
    const [confirming, setConfirming] = useState<'approve' | 'decline' | null>(null)
    const [isPending, setIsPending] = useState(false)

    const handleAction = async (action: 'approve' | 'decline') => {
        setIsPending(true)
        try {
            const response = await fetch('/api/hr/approve', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ requestId: row.id, action }),
            })
            const result = await response.json()
            if (result.success) {
                setConfirming(null)
                router.refresh()
            }
        } catch {
            // silently fail — user can retry
        } finally {
            setIsPending(false)
        }
    }

    if (confirming) {
        const isApprove = confirming === 'approve'
        return (
            <div className="px-4 py-3">
                <div className="text-sm text-gray-700">
                    {isApprove ? 'Approve' : 'Decline'}{' '}
                    <strong>{row.days} day{row.days !== 1 ? 's' : ''}</strong>{' '}
                    {row.leaveType.toLowerCase()} for <strong>{row.employeeName}</strong>?
                </div>
                <div className="mt-2 flex gap-2">
                    <button
                        onClick={() => handleAction(confirming)}
                        disabled={isPending}
                        className={`rounded-lg px-3 py-1 text-xs font-medium text-white disabled:opacity-50 ${
                            isApprove ? 'bg-emerald-600' : 'bg-red-600'
                        }`}
                    >
                        {isPending ? 'Processing...' : 'Confirm'}
                    </button>
                    <button
                        onClick={() => setConfirming(null)}
                        disabled={isPending}
                        className="rounded-lg border border-gray-300 px-3 py-1 text-xs font-medium text-gray-600"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="flex items-center justify-between px-4 py-3">
            <div className="flex-1">
                <div className="text-sm font-medium text-gray-900">
                    {row.employeeName}
                </div>
                <div className="text-xs text-gray-500">
                    {row.leaveType} · {row.days} day{row.days !== 1 ? 's' : ''} · {row.timeAgo}
                </div>
            </div>
            <div className="flex gap-1.5">
                <button
                    onClick={() => setConfirming('approve')}
                    className="rounded-lg border border-emerald-300 bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 transition hover:bg-emerald-100"
                >
                    Approve
                </button>
                <button
                    onClick={() => setConfirming('decline')}
                    className="rounded-lg border border-red-300 bg-red-50 px-2.5 py-1 text-xs font-medium text-red-700 transition hover:bg-red-100"
                >
                    Decline
                </button>
            </div>
        </div>
    )
}
