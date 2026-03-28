'use client'

import Card from '@/components/ui/Card'
import type { LeaveRequestSummary } from '@/server/actions/hr/getLeaveRequests'

const summaryItems: { key: keyof LeaveRequestSummary; label: string }[] = [
    { key: 'total', label: 'Total' },
    { key: 'pending', label: 'Pending' },
    { key: 'approved', label: 'Approved' },
    { key: 'rejected', label: 'Rejected' },
    { key: 'cancelled', label: 'Cancelled' },
]

export default function LeaveRequestsSummaryCards({
    summary,
}: {
    summary: LeaveRequestSummary
}) {
    return (
        <div className="grid grid-cols-2 gap-4 xl:grid-cols-5">
            {summaryItems.map((item) => (
                <Card key={item.key} bodyClass="p-4">
                    <div className="text-sm text-gray-500">{item.label}</div>
                    <div className="mt-1 text-2xl font-bold heading-text">
                        {summary[item.key]}
                    </div>
                </Card>
            ))}
        </div>
    )
}
