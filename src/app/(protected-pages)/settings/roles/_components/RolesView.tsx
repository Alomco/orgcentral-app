'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { RoleRow } from '@/server/actions/roles/getRoles'
import { PERMISSION_GROUPS, NEW_ROLE_DEFAULT_PERMISSIONS } from '@/server/lib/permissions'

interface RolesViewProps {
    roles: RoleRow[]
}

const ROLE_LABELS: Record<string, string> = {
    orgAdmin: 'Admin',
    manager: 'Manager',
    member: 'Staff',
}

export default function RolesView({ roles }: RolesViewProps) {
    const [editingRole, setEditingRole] = useState<RoleRow | null>(null)
    const [isCreating, setIsCreating] = useState(false)

    return (
        <>
            <div className="space-y-6 p-6">
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-semibold">Roles</h1>
                        <p className="text-sm text-gray-500">
                            Manage what each role can do in your organisation.
                        </p>
                    </div>
                    <button
                        onClick={() => setIsCreating(true)}
                        className="rounded-xl bg-primary px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:opacity-90"
                    >
                        Add role
                    </button>
                </div>

                <div className="space-y-3">
                    {roles.map((role) => (
                        <RoleCard
                            key={role.id}
                            role={role}
                            onEdit={() => setEditingRole(role)}
                        />
                    ))}
                </div>
            </div>

            {(editingRole || isCreating) && (
                <RoleModal
                    role={isCreating ? null : editingRole}
                    onClose={() => { setEditingRole(null); setIsCreating(false) }}
                />
            )}
        </>
    )
}

function RoleCard({ role, onEdit }: { role: RoleRow; onEdit: () => void }) {
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
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between">
                <div>
                    <div className="flex items-center gap-2">
                        <h3 className="text-sm font-semibold text-gray-900">{displayName}</h3>
                        {role.isSystem && (
                            <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-500">
                                System role
                            </span>
                        )}
                    </div>
                    {role.description && (
                        <p className="mt-0.5 text-xs text-gray-500">{role.description}</p>
                    )}
                    <p className="mt-1 text-xs text-gray-400">
                        {role.memberCount} member{role.memberCount !== 1 ? 's' : ''} ·{' '}
                        {role.permissions.length} permission{role.permissions.length !== 1 ? 's' : ''}
                    </p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={onEdit}
                        className="rounded-lg border border-gray-300 px-3 py-1 text-xs font-medium text-gray-600 transition hover:bg-gray-50"
                    >
                        Edit
                    </button>
                    {!confirming ? (
                        <button
                            onClick={() => setConfirming(true)}
                            disabled={!canDelete}
                            className="rounded-lg border border-red-200 px-3 py-1 text-xs font-medium text-red-500 transition hover:bg-red-50 disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                            Delete
                        </button>
                    ) : (
                        <div className="flex gap-1">
                            <button
                                onClick={handleDelete}
                                disabled={isPending}
                                className="rounded-lg bg-red-600 px-3 py-1 text-xs font-medium text-white disabled:opacity-50"
                            >
                                {isPending ? '...' : 'Confirm'}
                            </button>
                            <button
                                onClick={() => setConfirming(false)}
                                className="rounded-lg border border-gray-300 px-2 py-1 text-xs text-gray-500"
                            >
                                Cancel
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

function RoleModal({ role, onClose }: { role: RoleRow | null; onClose: () => void }) {
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
            prev.includes(key) ? prev.filter((p) => p !== key) : [...prev, key],
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

    const inputClass =
        'block w-full rounded-xl border border-gray-300 px-3 py-2 text-sm shadow-sm outline-none focus:border-primary'

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl border border-gray-200 bg-white shadow-xl">
                <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
                    <h3 className="text-lg font-semibold">
                        {isEditing ? 'Edit role' : 'Add a new role'}
                    </h3>
                    <button
                        onClick={onClose}
                        className="rounded-lg px-2 py-1 text-xl text-gray-500 hover:bg-gray-100"
                        aria-label="Close"
                    >
                        ×
                    </button>
                </div>

                <div className="space-y-5 px-6 py-5">
                    {error && (
                        <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                            {error}
                        </div>
                    )}

                    <div>
                        <label htmlFor="roleName" className="mb-1 block text-sm font-medium text-gray-700">
                            Role name <span className="text-red-500">*</span>
                        </label>
                        <input
                            id="roleName"
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            disabled={isEditing && role.isSystem}
                            className={isEditing && role.isSystem
                                ? 'block w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-500'
                                : inputClass
                            }
                            placeholder="e.g. Team Lead"
                        />
                        {isEditing && role.isSystem && (
                            <p className="mt-1 text-xs text-gray-400">System role names cannot be changed.</p>
                        )}
                    </div>

                    <div>
                        <label htmlFor="roleDesc" className="mb-1 block text-sm font-medium text-gray-700">
                            Description (optional)
                        </label>
                        <input
                            id="roleDesc"
                            type="text"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className={inputClass}
                            placeholder="What this role is for"
                        />
                    </div>

                    {/* Permission checkboxes */}
                    <div>
                        <div className="mb-3 text-sm font-medium text-gray-700">Permissions</div>
                        <div className="space-y-4">
                            {PERMISSION_GROUPS.map((group) => (
                                <div key={group.module}>
                                    <div className="mb-2 text-xs font-medium uppercase tracking-wide text-gray-400">
                                        {group.module}
                                    </div>
                                    <div className="space-y-1.5">
                                        {group.permissions.map((perm) => (
                                            <label
                                                key={perm.key}
                                                className="flex items-center gap-2.5 rounded-lg px-2 py-1.5 transition hover:bg-gray-50 cursor-pointer"
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={permissions.includes(perm.key)}
                                                    onChange={() => togglePermission(perm.key)}
                                                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                                                />
                                                <span className="text-sm text-gray-700">{perm.label}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-end gap-3 border-t border-gray-200 px-6 py-4">
                    <button
                        onClick={onClose}
                        disabled={isPending}
                        className="rounded-xl border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={isPending || !name.trim()}
                        className="rounded-xl bg-primary px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:opacity-90 disabled:opacity-50"
                    >
                        {isPending ? 'Saving...' : isEditing ? 'Save changes' : 'Create role'}
                    </button>
                </div>
            </div>
        </div>
    )
}
