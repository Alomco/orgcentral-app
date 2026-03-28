import { prisma } from '@/server/lib/prisma'
import Link from 'next/link'
import ActionConfirmForm from './_components/ActionConfirmForm'

interface Props {
    params: Promise<{ token: string }>
    searchParams: Promise<{ action?: string }>
}

export default async function LeaveActionPage({ params, searchParams }: Props) {
    const { token } = await params
    const { action: queryAction } = await searchParams

    const actionToken = await prisma.leaveActionToken.findUnique({
        where: { token },
        select: {
            id: true,
            token: true,
            action: true,
            used: true,
            expiresAt: true,
            targetUserId: true,
            leaveRequest: {
                select: {
                    id: true,
                    status: true,
                    startDate: true,
                    endDate: true,
                    hours: true,
                    reason: true,
                    userId: true,
                    orgId: true,
                    policy: { select: { name: true } },
                },
            },
        },
    })

    if (!actionToken) {
        return <ErrorCard message="This link is not valid. It may have been removed or the URL is incorrect." />
    }

    if (actionToken.used) {
        return <ErrorCard message="This link has already been used. The request has been actioned." />
    }

    if (actionToken.expiresAt < new Date()) {
        return <ErrorCard message="This link has expired. Please use the approvals dashboard to action this request." />
    }

    const lr = actionToken.leaveRequest
    if (!['SUBMITTED', 'PENDING_APPROVAL', 'AWAITING_MANAGER'].includes(lr.status)) {
        return <ErrorCard message="This request has already been actioned by someone else." />
    }

    // Get employee name
    const employee = await prisma.authUser.findUnique({
        where: { id: lr.userId },
        select: { name: true },
    })

    const action = queryAction === 'decline' ? 'decline' : (actionToken.action as 'approve' | 'decline')
    const days = Math.round((Number(lr.hours) / 7.5) * 2) / 2
    const employeeName = employee?.name ?? 'A team member'

    const formatDate = (d: Date) => d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
    const dateRange = lr.startDate.getTime() === lr.endDate.getTime()
        ? formatDate(lr.startDate)
        : `${formatDate(lr.startDate)} – ${formatDate(lr.endDate)}`

    return (
        <ActionConfirmForm
            token={token}
            action={action}
            employeeName={employeeName}
            leaveType={lr.policy.name}
            dateRange={dateRange}
            days={days}
            reason={lr.reason ?? undefined}
        />
    )
}

function ErrorCard({ message }: { message: string }) {
    return (
        <div className="orgcentral-brand flex min-h-screen items-center justify-center bg-gray-50 p-4">
            <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm">
                <div className="mb-4 text-lg font-bold" style={{ color: '#0066CC' }}>
                    OrgCentral
                </div>
                <h1 className="text-xl font-semibold text-gray-900">
                    Link not available
                </h1>
                <p className="mt-2 text-sm text-gray-500">{message}</p>
                <Link
                    href="/sign-in"
                    className="mt-6 inline-block rounded-xl bg-primary px-4 py-2 text-sm font-medium text-white transition hover:opacity-90"
                >
                    Go to OrgCentral
                </Link>
            </div>
        </div>
    )
}
