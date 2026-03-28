'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Dialog from '@/components/ui/Dialog'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { FormItem } from '@/components/ui/Form'
import type { ApprovalRequestRow } from '@/server/actions/hr/getLeaveRequestsForApproval'
import {
    approveLeaveRequest,
    type ApprovalAction,
} from '@/server/actions/hr/approveLeaveRequest'

interface ApprovalConfirmDialogProps {
    request: ApprovalRequestRow
    action: ApprovalAction
    approverId: string
    onClose: () => void
}

export default function ApprovalConfirmDialog({
    request,
    action,
    approverId,
    onClose,
}: ApprovalConfirmDialogProps) {
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

    return (
        <Dialog
            isOpen={true}
            onClose={onClose}
            onRequestClose={onClose}
            width={480}
        >
            <h4 className="mb-1">
                {isApprove ? 'Approve time off' : 'Decline time off'}
            </h4>

            <div className="flex flex-col gap-4 mt-4">
                {error && (
                    <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                        {error}
                    </div>
                )}

                {/* Confirmation summary */}
                <div className="rounded-lg bg-gray-50 dark:bg-gray-700 p-4 text-sm">
                    <p className="text-gray-900 dark:text-gray-100">
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
                    <FormItem label="Reason for declining (optional)">
                        <Input
                            textArea
                            rows={2}
                            value={note}
                            onChange={(e) =>
                                setNote(
                                    (e.target as HTMLTextAreaElement).value,
                                )
                            }
                            placeholder="Let them know why"
                            disabled={isPending}
                        />
                    </FormItem>
                )}

                <div className="flex justify-end gap-2 pt-2">
                    <Button
                        onClick={onClose}
                        disabled={isPending}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="solid"
                        onClick={handleConfirm}
                        loading={isPending}
                        className={
                            isApprove
                                ? 'bg-emerald-600 hover:bg-emerald-500'
                                : 'bg-red-600 hover:bg-red-500'
                        }
                    >
                        {isApprove ? 'Confirm approval' : 'Confirm decline'}
                    </Button>
                </div>
            </div>
        </Dialog>
    )
}
