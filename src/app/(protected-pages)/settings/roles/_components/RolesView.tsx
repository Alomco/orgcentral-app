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
            <div className="flex flex-col gap-4">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                    <div>
                        <h3>Roles</h3>
                        <p className="text-sm text-gray-500">
                            Manage what each role can do in your organisation.
                        </p>
                    </div>
                    <Button
                        variant="solid"
                        icon={<TbPlus className="text-xl" />}
                        onClick={() => setIsCreating(true)}
                    >
                        Add role
                    </Button>
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
