'use client'

import { useState } from 'react'
import type { ApprovalRequestRow } from '@/server/actions/hr/getLeaveRequestsForApproval'
import LeaveApprovalsTable from './LeaveApprovalsTable'
import ApprovalConfirmDialog from './ApprovalConfirmDialog'
import type { ApprovalAction } from '@/server/actions/hr/approveLeaveRequest'

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

    return (
        <>
            <div className="flex flex-col gap-4">
                <div>
                    <h3>Leave Approvals</h3>
                    <p className="text-sm text-gray-500">
                        Requests waiting for your decision
                    </p>
                </div>
                <LeaveApprovalsTable
                    data={requests}
                    onAction={(request, action) =>
                        setConfirmation({ request, action })
                    }
                />
            </div>
            {confirmation && (
                <ApprovalConfirmDialog
                    request={confirmation.request}
                    action={confirmation.action}
                    approverId={userId}
                    onClose={() => setConfirmation(null)}
                />
            )}
        </>
    )
}
