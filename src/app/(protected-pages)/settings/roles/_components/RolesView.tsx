'use client'

import { useState } from 'react'
import Button from '@/components/ui/Button'
import type { RoleRow } from '@/server/actions/roles/getRoles'
import RoleCard from './RoleCard'
import RoleModal from './RoleModal'
import { TbPlus } from 'react-icons/tb'

interface RolesViewProps {
    roles: RoleRow[]
}

export default function RolesView({ roles }: RolesViewProps) {
    const [editingRole, setEditingRole] = useState<RoleRow | null>(null)
    const [isCreating, setIsCreating] = useState(false)

    return (
        <>
            <div className="flex flex-col gap-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                    <div>
                        <h3>Roles & Permissions</h3>
                        <p className="text-sm text-gray-500">
                            Manage what each role can do in your organisation.
                        </p>
                    </div>
                    <Button
                        variant="solid"
                        icon={<TbPlus className="text-xl" />}
                        onClick={() => setIsCreating(true)}
                    >
                        Create role
                    </Button>
                </div>

                {/* Role cards grid — matches demo RolesPermissionsGroups layout */}
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                    {roles.map((role) => (
                        <RoleCard
                            key={role.id}
                            role={role}
                            onEdit={() => setEditingRole(role)}
                        />
                    ))}
                    {/* Add role card with dashed border */}
                    <button
                        type="button"
                        onClick={() => setIsCreating(true)}
                        className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-300 dark:border-gray-600 p-5 min-h-[160px] transition hover:border-primary hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer group"
                    >
                        <div className="rounded-full bg-gray-100 dark:bg-gray-600 p-3 mb-3 group-hover:bg-primary/10">
                            <TbPlus className="text-2xl text-gray-400 group-hover:text-primary" />
                        </div>
                        <span className="text-sm font-medium text-gray-500 group-hover:text-primary">
                            Add new role
                        </span>
                    </button>
                </div>
            </div>

            <RoleModal
                isOpen={editingRole !== null || isCreating}
                role={isCreating ? null : editingRole}
                onClose={() => {
                    setEditingRole(null)
                    setIsCreating(false)
                }}
            />
        </>
    )
}
