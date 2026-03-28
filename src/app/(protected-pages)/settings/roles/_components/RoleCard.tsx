'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Button from '@/components/ui/Button'
import Tag from '@/components/ui/Tag'
import Avatar from '@/components/ui/Avatar'
import ConfirmDialog from '@/components/shared/ConfirmDialog'
import UsersAvatarGroup from '@/components/shared/UsersAvatarGroup'
import type { RoleRow } from '@/server/actions/roles/getRoles'
import { TbArrowRight, TbTrash } from 'react-icons/tb'

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

    // Prepare users array for UsersAvatarGroup
    const avatarUsers = role.members.map((m) => ({ name: m.name }))

    return (
        <>
            {/* Card matching demo RolesPermissionsGroups pattern — bg-gray-100 rounded-2xl */}
            <div className="flex flex-col justify-between rounded-2xl p-5 bg-gray-100 dark:bg-gray-700 min-h-[160px]">
                <div>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <h6 className="font-bold">{displayName}</h6>
                            {role.isSystem && (
                                <Tag className="bg-gray-200 dark:bg-gray-600">
                                    <span className="text-[10px] font-medium text-gray-500 dark:text-gray-300">
                                        System
                                    </span>
                                </Tag>
                            )}
                        </div>
                        {canDelete && (
                            <Button
                                size="xs"
                                variant="plain"
                                className="p-1"
                                icon={<TbTrash className="text-red-400 hover:text-red-600" />}
                                onClick={() => setConfirming(true)}
                            />
                        )}
                    </div>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        {role.description || `${role.permissions.length} permission${role.permissions.length !== 1 ? 's' : ''}`}
                    </p>
                </div>
                <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center gap-2">
                        {avatarUsers.length > 0 ? (
                            <UsersAvatarGroup
                                avatarProps={{
                                    className:
                                        'cursor-pointer border-2 border-white dark:border-gray-500',
                                    size: 28,
                                }}
                                avatarGroupProps={{ maxCount: 3 }}
                                users={avatarUsers}
                            />
                        ) : (
                            <span className="text-xs text-gray-400">
                                No members
                            </span>
                        )}
                        {role.memberCount > 0 && (
                            <span className="text-xs text-gray-400 ml-1">
                                {role.memberCount} member{role.memberCount !== 1 ? 's' : ''}
                            </span>
                        )}
                    </div>
                    <Button
                        variant="plain"
                        size="sm"
                        className="py-0 h-auto"
                        icon={<TbArrowRight />}
                        iconAlignment="end"
                        onClick={onEdit}
                    >
                        Edit role
                    </Button>
                </div>
            </div>

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
                    This will permanently remove the{' '}
                    <strong>{displayName}</strong> role. This cannot be undone.
                </p>
            </ConfirmDialog>
        </>
    )
}
