'use client'

import { useState } from 'react'
import type { LeaveRequestRow, LeaveRequestSummary } from '@/server/actions/hr/getLeaveRequests'
import type { LeavePolicyOption } from '@/server/actions/hr/getLeavePolicies'
import LeaveRequestsSummaryCards from './LeaveRequestsSummaryCards'
import LeaveRequestsTable from './LeaveRequestsTable'
import LeaveRequestsActionTools from './LeaveRequestsActionTools'
import LeaveRequestModal from './LeaveRequestModal'

interface LeaveRequestsViewProps {
    initialRequests: LeaveRequestRow[]
    summary: LeaveRequestSummary
    policies: LeavePolicyOption[]
    userId: string
}

export default function LeaveRequestsView({
    initialRequests,
    summary,
    policies,
    userId,
}: LeaveRequestsViewProps) {
    const [isModalOpen, setIsModalOpen] = useState(false)

    return (
        <>
            <div className="flex flex-col gap-4">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                    <div>
                        <h3>Time off</h3>
                        <p className="text-sm text-gray-500">
                            View and manage your leave requests.
                        </p>
                    </div>
                    <LeaveRequestsActionTools
                        onRequestLeave={() => setIsModalOpen(true)}
                    />
                </div>
                <LeaveRequestsSummaryCards summary={summary} />
                <LeaveRequestsTable data={initialRequests} />
            </div>
            <LeaveRequestModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                policies={policies}
                userId={userId}
            />
        </>
    )
}
