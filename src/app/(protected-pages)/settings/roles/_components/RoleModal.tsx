'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Dialog from '@/components/ui/Dialog'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Avatar from '@/components/ui/Avatar'
import Switcher from '@/components/ui/Switcher'
import ScrollBar from '@/components/ui/ScrollBar'
import { FormItem } from '@/components/ui/Form'
import type { RoleRow } from '@/server/actions/roles/getRoles'
import {
    PERMISSION_GROUPS,
    NEW_ROLE_DEFAULT_PERMISSIONS,
} from '@/server/lib/permissions'
import type { PermissionGroup } from '@/server/lib/permissions'
import {
    TbUserCog,
    TbBuilding,
    TbChartBar,
    TbChevronDown,
    TbChevronRight,
} from 'react-icons/tb'
import type { ReactNode } from 'react'

const moduleIcon: Record<string, ReactNode> = {
    'HR — Leave': <TbUserCog />,
    Organisation: <TbBuilding />,
    Platform: <TbChartBar />,
}

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
    const [collapsedModules, setCollapsedModules] = useState<Set<string>>(
        new Set(),
    )

    const togglePermission = useCallback((key: string) => {
        setPermissions((prev) =>
            prev.includes(key)
                ? prev.filter((p) => p !== key)
                : [...prev, key],
        )
    }, [])

    const toggleModule = useCallback((moduleName: string) => {
        setCollapsedModules((prev) => {
            const next = new Set(prev)
            if (next.has(moduleName)) {
                next.delete(moduleName)
            } else {
                next.add(moduleName)
            }
            return next
        })
    }, [])

    const toggleAllInModule = useCallback(
        (group: PermissionGroup, allSelected: boolean) => {
            setPermissions((prev) => {
                const groupKeys = group.permissions.map((p) => p.key)
                if (allSelected) {
                    return prev.filter((p) => !groupKeys.includes(p))
                } else {
                    const newPerms = new Set(prev)
                    groupKeys.forEach((k) => newPerms.add(k))
                    return Array.from(newPerms)
                }
            })
        },
        [],
    )

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
        setCollapsedModules(new Set())
        onClose()
    }

    return (
        <Dialog
            isOpen={isOpen}
            onClose={handleClose}
            onRequestClose={handleClose}
            width={640}
            contentClassName="pb-0 px-0"
        >
            {/* Header — outside scroll area */}
            <div className="px-6 pt-4 pb-2">
                <h4>{isEditing ? role.name : 'Create role'}</h4>
                {isEditing && role.description && (
                    <p className="text-sm text-gray-500 mt-1">
                        {role.description}
                    </p>
                )}
            </div>

            {/* Scrollable content — fixed max-height so it never overflows viewport */}
            <ScrollBar className="max-h-[60vh] overflow-y-auto">
                <div className="px-6 py-4 flex flex-col gap-5">
                    {error && (
                        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                            {error}
                        </div>
                    )}

                    {/* Name + description fields */}
                    <FormItem label="Role name" asterisk>
                        <Input
                            type="text"
                            value={name}
                            onChange={(e) =>
                                setName(
                                    (e.target as HTMLInputElement).value,
                                )
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

                    {/* Permission modules — collapsible with select all toggle */}
                    <div>
                        <span className="font-semibold heading-text mb-2 block">
                            Permissions
                        </span>

                        {PERMISSION_GROUPS.map((group, index) => {
                            const isCollapsed = collapsedModules.has(
                                group.module,
                            )
                            const groupKeys = group.permissions.map(
                                (p) => p.key,
                            )
                            const allSelected = groupKeys.every((k) =>
                                permissions.includes(k),
                            )
                            const someSelected =
                                !allSelected &&
                                groupKeys.some((k) =>
                                    permissions.includes(k),
                                )
                            const isLast =
                                index === PERMISSION_GROUPS.length - 1

                            return (
                                <div
                                    key={group.module}
                                    className={`py-4 ${!isLast ? 'border-b border-gray-200 dark:border-gray-600' : ''}`}
                                >
                                    {/* Module header with icon, name, select all, and collapse toggle */}
                                    <div className="flex items-center justify-between">
                                        <button
                                            type="button"
                                            className="flex items-center gap-3 flex-1 text-left"
                                            onClick={() =>
                                                toggleModule(group.module)
                                            }
                                        >
                                            <Avatar
                                                className="bg-transparent dark:bg-transparent p-2 border-2 border-gray-200 dark:border-gray-600 text-primary"
                                                size={40}
                                                icon={
                                                    moduleIcon[
                                                        group.module
                                                    ] ?? <TbUserCog />
                                                }
                                                shape="round"
                                            />
                                            <div>
                                                <h6 className="font-bold text-sm">
                                                    {group.module}
                                                </h6>
                                                <span className="text-xs text-gray-400">
                                                    {groupKeys.filter((k) =>
                                                        permissions.includes(
                                                            k,
                                                        ),
                                                    ).length}{' '}
                                                    of {groupKeys.length}{' '}
                                                    enabled
                                                </span>
                                            </div>
                                            {isCollapsed ? (
                                                <TbChevronRight className="text-gray-400 ml-auto" />
                                            ) : (
                                                <TbChevronDown className="text-gray-400 ml-auto" />
                                            )}
                                        </button>
                                        <div className="flex items-center gap-2 ml-4">
                                            <span className="text-xs text-gray-400">
                                                All
                                            </span>
                                            <Switcher
                                                checked={allSelected}
                                                onChange={() =>
                                                    toggleAllInModule(
                                                        group,
                                                        allSelected,
                                                    )
                                                }
                                                className={
                                                    someSelected
                                                        ? 'opacity-70'
                                                        : ''
                                                }
                                            />
                                        </div>
                                    </div>

                                    {/* Individual permission toggles */}
                                    {!isCollapsed && (
                                        <div className="mt-3 ml-[52px] space-y-1">
                                            {group.permissions.map(
                                                (perm) => (
                                                    <div
                                                        key={perm.key}
                                                        className="flex items-center justify-between rounded-lg px-3 py-2 transition hover:bg-gray-50 dark:hover:bg-gray-600/50"
                                                    >
                                                        <span className="text-sm text-gray-700 dark:text-gray-300">
                                                            {perm.label}
                                                        </span>
                                                        <Switcher
                                                            checked={permissions.includes(
                                                                perm.key,
                                                            )}
                                                            onChange={() =>
                                                                togglePermission(
                                                                    perm.key,
                                                                )
                                                            }
                                                        />
                                                    </div>
                                                ),
                                            )}
                                        </div>
                                    )}
                                </div>
                            )
                        })}
                    </div>
                </div>
            </ScrollBar>

            {/* Footer — fixed outside scroll area */}
            <div className="px-6 py-3 bg-gray-100 dark:bg-gray-700 rounded-bl-2xl rounded-br-2xl">
                <div className="flex justify-end items-center gap-2">
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
