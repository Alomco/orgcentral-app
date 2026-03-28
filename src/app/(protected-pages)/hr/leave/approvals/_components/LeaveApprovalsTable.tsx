'use client'

import { useMemo } from 'react'
import Button from '@/components/ui/Button'
import DataTable from '@/components/shared/DataTable'
import type { ColumnDef } from '@/components/shared/DataTable'
import type { ApprovalRequestRow } from '@/server/actions/hr/getLeaveRequestsForApproval'
import type { ApprovalAction } from '@/server/actions/hr/approveLeaveRequest'
import { TbCheck, TbX } from 'react-icons/tb'

interface LeaveApprovalsTableProps {
    data: ApprovalRequestRow[]
    onAction: (request: ApprovalRequestRow, action: ApprovalAction) => void
}

export default function LeaveApprovalsTable({
    data,
    onAction,
}: LeaveApprovalsTableProps) {
    const columns: ColumnDef<ApprovalRequestRow>[] = useMemo(
        () => [
            {
                header: 'Employee',
                accessorKey: 'employeeName',
                cell: (props) => (
                    <span className="font-semibold heading-text">
                        {props.row.original.employeeName}
                    </span>
                ),
            },
            {
                header: 'Leave type',
                accessorKey: 'leaveType',
            },
            {
                header: 'Dates',
                accessorKey: 'dates',
            },
            {
                header: 'Duration',
                accessorKey: 'days',
                cell: (props) => {
                    const days = props.row.original.days
                    return (
                        <span className="font-semibold">
                            {days} day{days !== 1 ? 's' : ''}
                        </span>
                    )
                },
            },
            {
                header: 'Reason',
                accessorKey: 'reason',
                cell: (props) => (
                    <span className="text-gray-500 max-w-[200px] truncate block">
                        {props.row.original.reason || '—'}
                    </span>
                ),
            },
            {
                header: 'Submitted',
                accessorKey: 'submittedAt',
            },
            {
                header: 'Actions',
                id: 'actions',
                cell: (props) => {
                    const row = props.row.original
                    return (
                        <div className="flex gap-2 justify-end">
                            <Button
                                size="xs"
                                variant="solid"
                                className="bg-emerald-600 hover:bg-emerald-500"
                                icon={<TbCheck />}
                                onClick={() => onAction(row, 'approve')}
                            >
                                Approve
                            </Button>
                            <Button
                                size="xs"
                                customColorClass={() =>
                                    'text-red-600 bg-red-50 hover:bg-red-100 border border-red-200'
                                }
                                icon={<TbX />}
                                onClick={() => onAction(row, 'decline')}
                            >
                                Decline
                            </Button>
                        </div>
                    )
                },
            },
        ],
        [onAction],
    )

    return (
        <DataTable
            columns={columns}
            data={data}
            noData={data.length === 0}
            loading={false}
            pagingData={{
                total: data.length,
                pageIndex: 1,
                pageSize: 10,
            }}
        />
    )
}
