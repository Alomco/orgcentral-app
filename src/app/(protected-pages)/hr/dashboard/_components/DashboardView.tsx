'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Avatar from '@/components/ui/Avatar'
import Tag from '@/components/ui/Tag'
import ConfirmDialog from '@/components/shared/ConfirmDialog'
import type { DashboardStats } from '@/server/actions/dashboard/getDashboardStats'
import type { UpcomingLeaveRow } from '@/server/actions/dashboard/getUpcomingLeave'
import type { PendingSnapshotRow } from '@/server/actions/dashboard/getPendingApprovalsSnapshot'
import {
    TbCalendarTime,
    TbUsers,
    TbSunHigh,
    TbClipboardCheck,
    TbPlus,
    TbArrowRight,
} from 'react-icons/tb'

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

const statCardConfig = [
    { key: 'totalStaff' as const, label: 'Total staff', icon: TbUsers, color: 'bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-100' },
    { key: 'offToday' as const, label: 'Off today', icon: TbSunHigh, color: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-100' },
    { key: 'pendingApprovals' as const, label: 'Pending approvals', icon: TbClipboardCheck, color: 'bg-amber-100 text-amber-600 dark:bg-amber-500/20 dark:text-amber-100', href: '/hr/leave/approvals' },
    { key: 'requestsThisMonth' as const, label: 'This month', icon: TbCalendarTime, color: 'bg-purple-100 text-purple-600 dark:bg-purple-500/20 dark:text-purple-100' },
]

export default function DashboardView({
    stats,
    upcoming,
    pendingSnapshot,
    userId,
}: DashboardViewProps) {
    return (
        <div className="flex flex-col gap-6">
            {/* Welcome header */}
            <div>
                <h3>
                    {getGreeting()}, {stats.firstName}
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                    {formatToday()} · {stats.orgName}
                </p>
            </div>

            {/* Stat cards */}
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                {statCardConfig.map((item) => {
                    const Icon = item.icon
                    const value = stats[item.key]
                    const isHighlight = item.key === 'pendingApprovals' && value > 0
                    const card = (
                        <Card
                            key={item.key}
                            bodyClass="p-5"
                            className={isHighlight ? 'border-amber-200 bg-amber-50/50 dark:bg-amber-500/5' : ''}
                            clickable={!!item.href}
                        >
                            <div className="flex items-center gap-3">
                                <Avatar
                                    className={item.color}
                                    shape="round"
                                    size={40}
                                    icon={<Icon className="text-xl" />}
                                />
                                <div>
                                    <div className="text-sm text-gray-500">{item.label}</div>
                                    <div className={`text-2xl font-bold ${isHighlight ? 'text-amber-600' : 'heading-text'}`}>
                                        {value}
                                    </div>
                                </div>
                            </div>
                        </Card>
                    )
                    if (item.href) {
                        return <Link key={item.key} href={item.href}>{card}</Link>
                    }
                    return card
                })}
            </div>

            {/* Two-column: upcoming leave + pending approvals */}
            <div className="grid gap-6 lg:grid-cols-2">
                {/* Upcoming leave */}
                <Card
                    header={{
                        content: 'Upcoming leave',
                        extra: (
                            <Link href="/hr/leave/requests" className="text-xs text-primary hover:underline">
                                View all
                            </Link>
                        ),
                    }}
                >
                    {upcoming.length === 0 ? (
                        <div className="py-4 text-center text-sm text-gray-400">
                            No upcoming approved leave
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-100 dark:divide-gray-700 -mx-5 -mb-5">
                            {upcoming.map((row) => (
                                <div key={row.id} className="flex items-center justify-between px-5 py-3">
                                    <div className="flex items-center gap-3">
                                        <Avatar
                                            shape="circle"
                                            size={32}
                                            className="bg-primary/10 text-primary"
                                        >
                                            {row.employeeName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                                        </Avatar>
                                        <div>
                                            <div className="text-sm font-medium heading-text">
                                                {row.employeeName}
                                            </div>
                                            <div className="text-xs text-gray-500">
                                                {row.leaveType} · {row.dates}
                                            </div>
                                        </div>
                                    </div>
                                    <Tag className="bg-gray-100 dark:bg-gray-600">
                                        <span className="text-xs font-medium text-gray-600 dark:text-gray-300">
                                            {row.days} day{row.days !== 1 ? 's' : ''}
                                        </span>
                                    </Tag>
                                </div>
                            ))}
                        </div>
                    )}
                </Card>

                {/* Pending approvals snapshot */}
                <Card
                    header={{
                        content: 'Needs your attention',
                        extra: pendingSnapshot.length > 0 ? (
                            <Link href="/hr/leave/approvals" className="text-xs text-primary hover:underline">
                                View all
                            </Link>
                        ) : undefined,
                    }}
                >
                    {pendingSnapshot.length === 0 ? (
                        <div className="py-4 text-center text-sm text-gray-400">
                            No requests waiting for approval
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-100 dark:divide-gray-700 -mx-5 -mb-5">
                            {pendingSnapshot.map((row) => (
                                <PendingRow key={row.id} row={row} userId={userId} />
                            ))}
                        </div>
                    )}
                </Card>
            </div>

            {/* Quick actions */}
            <Card>
                <h5 className="mb-4">Quick actions</h5>
                <div className="flex flex-wrap gap-3">
                    {stats.pendingApprovals > 0 && (
                        <Link href="/hr/leave/approvals">
                            <Button
                                size="sm"
                                icon={<TbClipboardCheck />}
                            >
                                Approve pending requests
                            </Button>
                        </Link>
                    )}
                    <Link href="/hr/leave/requests">
                        <Button
                            size="sm"
                            icon={<TbPlus />}
                        >
                            Request time off
                        </Button>
                    </Link>
                    <Link href="/team">
                        <Button
                            size="sm"
                            icon={<TbUsers />}
                        >
                            Invite a team member
                        </Button>
                    </Link>
                    <Link href="/team">
                        <Button
                            size="sm"
                            icon={<TbArrowRight />}
                        >
                            View your team
                        </Button>
                    </Link>
                </div>
            </Card>
        </div>
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

    return (
        <>
            <div className="flex items-center justify-between px-5 py-3">
                <div className="flex items-center gap-3 flex-1">
                    <Avatar
                        shape="circle"
                        size={32}
                        className="bg-amber-100 text-amber-600"
                    >
                        {row.employeeName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                    </Avatar>
                    <div>
                        <div className="text-sm font-medium heading-text">
                            {row.employeeName}
                        </div>
                        <div className="text-xs text-gray-500">
                            {row.leaveType} · {row.days} day{row.days !== 1 ? 's' : ''} · {row.timeAgo}
                        </div>
                    </div>
                </div>
                <div className="flex gap-1.5">
                    <Button
                        size="xs"
                        className="bg-emerald-600 hover:bg-emerald-500 text-white"
                        variant="solid"
                        onClick={() => setConfirming('approve')}
                    >
                        Approve
                    </Button>
                    <Button
                        size="xs"
                        customColorClass={() =>
                            'text-red-600 bg-red-50 hover:bg-red-100 border border-red-200'
                        }
                        onClick={() => setConfirming('decline')}
                    >
                        Decline
                    </Button>
                </div>
            </div>

            {/* Decision: using ConfirmDialog for approve/decline to match ECME patterns */}
            <ConfirmDialog
                isOpen={confirming === 'approve'}
                type="success"
                title="Approve time off"
                onClose={() => setConfirming(null)}
                onCancel={() => setConfirming(null)}
                onConfirm={() => handleAction('approve')}
                confirmText={isPending ? 'Processing...' : 'Confirm'}
                confirmButtonProps={{
                    className: 'bg-emerald-600 hover:bg-emerald-500',
                    disabled: isPending,
                }}
            >
                <p className="text-sm">
                    Approve <strong>{row.days} day{row.days !== 1 ? 's' : ''}</strong>{' '}
                    {row.leaveType.toLowerCase()} for <strong>{row.employeeName}</strong>?
                </p>
            </ConfirmDialog>
            <ConfirmDialog
                isOpen={confirming === 'decline'}
                type="danger"
                title="Decline time off"
                onClose={() => setConfirming(null)}
                onCancel={() => setConfirming(null)}
                onConfirm={() => handleAction('decline')}
                confirmText={isPending ? 'Processing...' : 'Decline'}
                confirmButtonProps={{
                    className: 'bg-red-600 hover:bg-red-500',
                    disabled: isPending,
                }}
            >
                <p className="text-sm">
                    Decline <strong>{row.days} day{row.days !== 1 ? 's' : ''}</strong>{' '}
                    {row.leaveType.toLowerCase()} for <strong>{row.employeeName}</strong>?
                </p>
            </ConfirmDialog>
        </>
    )
}
