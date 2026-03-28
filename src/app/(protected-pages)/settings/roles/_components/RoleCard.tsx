'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Tag from '@/components/ui/Tag'
import ConfirmDialog from '@/components/shared/ConfirmDialog'
import type { RoleRow } from '@/server/actions/roles/getRoles'
import { TbEdit, TbTrash } from 'react-icons/tb'

const ROLE_LABELS: Record<string, string> = {
    orgAdmin: 'Admin',
    manager: 'Manager',
    member: 'Staff',
}

interface RoleCardProps {
    role: RoleRow
    onEdit: () => void
}

export default function RoleCard({ role, onEdit }: RoleCardProps) {
    const router = useRouter()
    const [confirming, setConfirming] = useState(false)
    const [isPending, setIsPending] = useState(false)

    const displayName = ROLE_LABELS[role.name] ?? role.name
    const canDelete = !role.isSystem && role.memberCount === 0

    const handleDelete = async () => {
        setIsPending(true)
        const res = await fetch('/api/roles/delete', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ roleId: role.id }),
        })
        const result = await res.json()
        if (result.success) {
            setConfirming(false)
            router.refresh()
        }
        setIsPending(false)
    }

    return (
        <>
            <Card bodyClass="p-5">
                <div className="flex items-start justify-between">
                    <div>
                        <div className="flex items-center gap-2">
                            <h5 className="text-sm">{displayName}</h5>
                            {role.isSystem && (
                                <Tag className="bg-gray-100 dark:bg-gray-600">
                                    <span className="text-[10px] font-medium text-gray-500 dark:text-gray-300">
                                        System role
                                    </span>
                                </Tag>
                            )}
                        </div>
                        {role.description && (
                            <p className="mt-0.5 text-xs text-gray-500">
                                {role.description}
                            </p>
                        )}
                        <p className="mt-1 text-xs text-gray-400">
                            {role.memberCount} member{role.memberCount !== 1 ? 's' : ''} ·{' '}
                            {role.permissions.length} permission
                            {role.permissions.length !== 1 ? 's' : ''}
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Button
                            size="xs"
                            icon={<TbEdit />}
                            onClick={onEdit}
                        >
                            Edit
                        </Button>
                        <Button
                            size="xs"
                            icon={<TbTrash />}
                            disabled={!canDelete}
                            customColorClass={() =>
                                'text-red-500 border border-red-200 hover:bg-red-50 disabled:opacity-30'
                            }
                            onClick={() => setConfirming(true)}
                        >
                            Delete
                        </Button>
                    </div>
                </div>
            </Card>

            {/* Decision: ConfirmDialog with danger type for role deletion */}
            <ConfirmDialog
                isOpen={confirming}
                type="danger"
                title={`Delete "${displayName}" role`}
                onClose={() => setConfirming(false)}
                onCancel={() => setConfirming(false)}
                onConfirm={handleDelete}
                confirmText={isPending ? 'Deleting...' : 'Delete role'}
                confirmButtonProps={{
                    className: 'bg-red-600 hover:bg-red-500',
                    disabled: isPending,
                }}
            >
                <p className="text-sm">
                    This will permanently remove the <strong>{displayName}</strong> role.
                    This cannot be undone.
                </p>
            </ConfirmDialog>
        </>
    )
}
