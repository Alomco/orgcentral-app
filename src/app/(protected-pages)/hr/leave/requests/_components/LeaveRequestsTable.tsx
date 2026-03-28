'use client'

import { useMemo } from 'react'
import Tag from '@/components/ui/Tag'
import DataTable from '@/components/shared/DataTable'
import type { ColumnDef } from '@/components/shared/DataTable'
import type { LeaveRequestRow } from '@/server/actions/hr/getLeaveRequests'

const statusColor: Record<
    string,
    { bgClass: string; textClass: string }
> = {
    Pending: { bgClass: 'bg-warning-subtle', textClass: 'text-warning' },
    Approved: { bgClass: 'bg-success-subtle', textClass: 'text-success' },
    Rejected: { bgClass: 'bg-error-subtle', textClass: 'text-error' },
    Cancelled: { bgClass: 'bg-gray-100 dark:bg-gray-700', textClass: 'text-gray-500' },
}

export default function LeaveRequestsTable({
    data,
}: {
    data: LeaveRequestRow[]
}) {
    const columns: ColumnDef<LeaveRequestRow>[] = useMemo(
        () => [
            {
                header: 'Type',
                accessorKey: 'type',
                cell: (props) => (
                    <span className="font-semibold heading-text">
                        {props.row.original.type}
                    </span>
                ),
            },
            {
                header: 'Dates',
                accessorKey: 'dates',
                cell: (props) => (
                    <span>{props.row.original.dates}</span>
                ),
            },
            {
                header: 'Days',
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
                header: 'Status',
                accessorKey: 'status',
                cell: (props) => {
                    const status = props.row.original.status
                    const color = statusColor[status] ?? statusColor.Pending
                    return (
                        <Tag className={color.bgClass}>
                            <span className={`capitalize font-semibold ${color.textClass}`}>
                                {status}
                            </span>
                        </Tag>
                    )
                },
            },
            {
                header: 'Evidence',
                accessorKey: 'evidence',
                cell: (props) => (
                    <span className="text-gray-500">
                        {props.row.original.evidence || '—'}
                    </span>
                ),
            },
            {
                header: 'Submitted',
                accessorKey: 'submitted',
                cell: (props) => (
                    <span>{props.row.original.submitted}</span>
                ),
            },
            {
                header: 'Approver',
                accessorKey: 'approverSla',
                cell: (props) => (
                    <span className="text-gray-500">
                        {props.row.original.approverSla}
                    </span>
                ),
            },
        ],
        [],
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
