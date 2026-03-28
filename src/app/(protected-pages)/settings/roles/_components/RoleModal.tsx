'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Dialog from '@/components/ui/Dialog'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Switcher from '@/components/ui/Switcher'
import { FormItem } from '@/components/ui/Form'
import type { RoleRow } from '@/server/actions/roles/getRoles'
import { PERMISSION_GROUPS, NEW_ROLE_DEFAULT_PERMISSIONS } from '@/server/lib/permissions'

interface RoleModalProps {
    isOpen: boolean
    role: RoleRow | null
    onClose: () => void
}

export default function RoleModal({ isOpen, role, onClose }: RoleModalProps) {
    const router = useRouter()
    const isEditing = role !== null
    const [name, setName] = useState(role?.name ?? '')
    const [description, setDescription] = useState(role?.description ?? '')
    const [permissions, setPermissions] = useState<string[]>(
        role?.permissions ?? NEW_ROLE_DEFAULT_PERMISSIONS,
    )
    const [isPending, setIsPending] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const togglePermission = (key: string) => {
        setPermissions((prev) =>
            prev.includes(key)
                ? prev.filter((p) => p !== key)
                : [...prev, key],
        )
    }

    const handleSave = async () => {
        setError(null)
        setIsPending(true)

        const url = isEditing ? '/api/roles/update' : '/api/roles/create'
        const body = isEditing
            ? { roleId: role.id, name, description, permissions }
            : { name, description, permissions }

        try {
            const res = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            })
            const result = await res.json()
            if (result.success) {
                onClose()
                router.refresh()
            } else {
                setError(result.error ?? 'Something went wrong.')
            }
        } catch {
            setError('Something went wrong. Please try again.')
        } finally {
            setIsPending(false)
        }
    }

    const handleClose = () => {
        setName(role?.name ?? '')
        setDescription(role?.description ?? '')
        setPermissions(role?.permissions ?? NEW_ROLE_DEFAULT_PERMISSIONS)
        setError(null)
        onClose()
    }

    return (
        <Dialog
            isOpen={isOpen}
            onClose={handleClose}
            onRequestClose={handleClose}
            width={520}
        >
            <h4 className="mb-1">
                {isEditing ? 'Edit role' : 'Add a new role'}
            </h4>
            <p className="text-sm text-gray-500 mb-6">
                {isEditing
                    ? 'Update permissions for this role.'
                    : 'Create a new role with custom permissions.'}
            </p>

            <div className="flex flex-col gap-5">
                {error && (
                    <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                        {error}
                    </div>
                )}

                <FormItem label="Role name" asterisk>
                    <Input
                        type="text"
                        value={name}
                        onChange={(e) =>
                            setName((e.target as HTMLInputElement).value)
                        }
                        disabled={isEditing && role.isSystem}
                        placeholder="e.g. Team Lead"
                    />
                    {isEditing && role.isSystem && (
                        <p className="mt-1 text-xs text-gray-400">
                            System role names cannot be changed.
                        </p>
                    )}
                </FormItem>

                <FormItem label="Description (optional)">
                    <Input
                        type="text"
                        value={description}
                        onChange={(e) =>
                            setDescription(
                                (e.target as HTMLInputElement).value,
                            )
                        }
                        placeholder="What this role is for"
                    />
                </FormItem>

                {/* Permission toggles — using Switcher instead of checkboxes per task spec */}
                <div>
                    <div className="mb-3 text-sm font-medium heading-text">
                        Permissions
                    </div>
                    <div className="space-y-4">
                        {PERMISSION_GROUPS.map((group) => (
                            <div key={group.module}>
                                <div className="mb-2 text-xs font-medium uppercase tracking-wide text-gray-400">
                                    {group.module}
                                </div>
                                <div className="space-y-2">
                                    {group.permissions.map((perm) => (
                                        <div
                                            key={perm.key}
                                            className="flex items-center justify-between rounded-lg px-2 py-1.5 transition hover:bg-gray-50 dark:hover:bg-gray-700"
                                        >
                                            <span className="text-sm text-gray-700 dark:text-gray-300">
                                                {perm.label}
                                            </span>
                                            <Switcher
                                                checked={permissions.includes(
                                                    perm.key,
                                                )}
                                                onChange={() =>
                                                    togglePermission(perm.key)
                                                }
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                    <Button onClick={handleClose} disabled={isPending}>
                        Cancel
                    </Button>
                    <Button
                        variant="solid"
                        onClick={handleSave}
                        loading={isPending}
                        disabled={!name.trim()}
                    >
                        {isEditing ? 'Save changes' : 'Create role'}
                    </Button>
                </div>
            </div>
        </Dialog>
    )
}
