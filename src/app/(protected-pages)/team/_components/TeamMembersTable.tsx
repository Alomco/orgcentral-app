'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import Avatar from '@/components/ui/Avatar'
import Button from '@/components/ui/Button'
import Tag from '@/components/ui/Tag'
import Select from '@/components/ui/Select'
import DataTable from '@/components/shared/DataTable'
import type { ColumnDef } from '@/components/shared/DataTable'
import type { TeamMemberRow } from '@/server/actions/team/getTeamMembers'
import type { RoleRow } from '@/server/actions/roles/getRoles'

const ROLE_DISPLAY: Record<string, string> = {
    orgAdmin: 'Admin',
    manager: 'Manager',
    member: 'Staff',
}

interface TeamMembersTableProps {
    members: TeamMemberRow[]
    roles: RoleRow[]
    isAdmin: boolean
    userId: string
}

export default function TeamMembersTable({
    members,
    roles,
    isAdmin,
    userId,
}: TeamMembersTableProps) {
    const columns: ColumnDef<TeamMemberRow>[] = useMemo(
        () => {
            const cols: ColumnDef<TeamMemberRow>[] = [
                {
                    header: 'Name',
                    accessorKey: 'name',
                    cell: (props) => {
                        const name = props.row.original.name
                        const initials = name
                            .split(' ')
                            .map((n) => n[0])
                            .join('')
                            .slice(0, 2)
                        return (
                            <div className="flex items-center gap-3">
                                <Avatar
                                    shape="circle"
                                    size={32}
                                    className="bg-primary/10 text-primary"
                                >
                                    {initials}
                                </Avatar>
                                <span className="font-semibold heading-text">
                                    {name}
                                </span>
                            </div>
                        )
                    },
                },
                {
                    header: 'Email',
                    accessorKey: 'email',
                    cell: (props) => (
                        <span className="text-gray-500">
                            {props.row.original.email}
                        </span>
                    ),
                },
                {
                    header: 'Role',
                    accessorKey: 'role',
                    cell: (props) => (
                        <Tag className="bg-gray-100 dark:bg-gray-600">
                            <span className="font-medium text-gray-600 dark:text-gray-300">
                                {props.row.original.role}
                            </span>
                        </Tag>
                    ),
                },
                {
                    header: 'Joined',
                    accessorKey: 'joinedAt',
                    cell: (props) => (
                        <span className="text-gray-500">
                            {props.row.original.joinedAt}
                        </span>
                    ),
                },
            ]

            if (isAdmin) {
                cols.push({
                    header: 'Actions',
                    id: 'actions',
                    cell: (props) => (
                        <RoleChangeCell
                            member={props.row.original}
                            roles={roles}
                            userId={userId}
                        />
                    ),
                })
            }

            return cols
        },
        [isAdmin, roles, userId],
    )

    return (
        <DataTable
            columns={columns}
            data={members}
            noData={members.length === 0}
            loading={false}
            pagingData={{
                total: members.length,
                pageIndex: 1,
                pageSize: 10,
            }}
        />
    )
}

function RoleChangeCell({
    member,
    roles,
    userId,
}: {
    member: TeamMemberRow
    roles: RoleRow[]
    userId: string
}) {
    const router = useRouter()
    const [changing, setChanging] = useState(false)
    const [isPending, setIsPending] = useState(false)
    const isSelf = member.id === userId

    const roleOptions = roles.map((r) => ({
        value: r.id,
        label: ROLE_DISPLAY[r.name] ?? r.name,
    }))

    const handleChangeRole = async (newRoleId: string) => {
        setIsPending(true)
        try {
            const res = await fetch('/api/team/change-role', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ memberId: member.id, roleId: newRoleId }),
            })
            const result = await res.json()
            if (result.success) {
                setChanging(false)
                router.refresh()
            }
        } catch {
            // silently fail
        } finally {
            setIsPending(false)
        }
    }

    if (isSelf) {
        return <span className="text-xs text-gray-400">You</span>
    }

    if (changing) {
        return (
            <div className="w-32">
                <Select
                    size="sm"
                    options={roleOptions}
                    value={roleOptions.find((o) => o.value === member.roleId)}
                    onChange={(opt) => {
                        if (opt && 'value' in opt) {
                            handleChangeRole(opt.value)
                        }
                    }}
                    isDisabled={isPending}
                    menuPlacement="auto"
                />
            </div>
        )
    }

    return (
        <Button
            size="xs"
            onClick={() => setChanging(true)}
        >
            Change role
        </Button>
    )
}
