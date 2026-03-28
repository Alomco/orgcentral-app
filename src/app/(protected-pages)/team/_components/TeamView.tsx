'use client'

import { useState } from 'react'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import Tag from '@/components/ui/Tag'
import Avatar from '@/components/ui/Avatar'
import type { TeamMemberRow } from '@/server/actions/team/getTeamMembers'
import type { PendingInvitationRow } from '@/server/actions/team/getPendingInvitations'
import type { RoleRow } from '@/server/actions/roles/getRoles'
import TeamMembersTable from './TeamMembersTable'
import InviteModal from './InviteModal'
import { TbPlus, TbMail } from 'react-icons/tb'

interface TeamViewProps {
    members: TeamMemberRow[]
    invitations: PendingInvitationRow[]
    userId: string
    roles: RoleRow[]
    isAdmin: boolean
}

export default function TeamView({
    members,
    invitations,
    userId,
    roles,
    isAdmin,
}: TeamViewProps) {
    const [isModalOpen, setIsModalOpen] = useState(false)
    const isJustYou = members.length <= 1 && invitations.length === 0

    return (
        <>
            <div className="flex flex-col gap-4">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                    <div>
                        <h3>Your team</h3>
                        <p className="text-sm text-gray-500">
                            {isJustYou
                                ? 'Invite people to join your organisation.'
                                : `${members.length} member${members.length !== 1 ? 's' : ''}`}
                        </p>
                    </div>
                    <Button
                        variant="solid"
                        icon={<TbPlus className="text-xl" />}
                        onClick={() => setIsModalOpen(true)}
                    >
                        Invite someone
                    </Button>
                </div>

                {isJustYou ? (
                    <Card bodyClass="p-8 text-center">
                        <p className="text-lg font-medium heading-text">
                            Your team is just you for now
                        </p>
                        <p className="mt-2 text-sm text-gray-500">
                            Invite your first team member to get started.
                        </p>
                        <div className="mt-4">
                            <Button
                                variant="solid"
                                icon={<TbPlus />}
                                onClick={() => setIsModalOpen(true)}
                            >
                                Invite someone
                            </Button>
                        </div>
                    </Card>
                ) : (
                    <>
                        <TeamMembersTable
                            members={members}
                            roles={roles}
                            isAdmin={isAdmin}
                            userId={userId}
                        />

                        {/* Pending invitations */}
                        {invitations.length > 0 && (
                            <Card
                                header={{
                                    content: `Pending invitations (${invitations.length})`,
                                }}
                            >
                                <div className="space-y-3">
                                    {invitations.map((inv) => (
                                        <div
                                            key={inv.token}
                                            className="flex items-center justify-between rounded-lg border border-dashed border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 px-4 py-3"
                                        >
                                            <div className="flex items-center gap-3">
                                                <Avatar
                                                    shape="circle"
                                                    size={32}
                                                    className="bg-amber-100 text-amber-600"
                                                    icon={<TbMail />}
                                                />
                                                <div>
                                                    <div className="text-sm font-medium heading-text">
                                                        {inv.email}
                                                    </div>
                                                    <div className="text-xs text-gray-400">
                                                        {inv.role} · Sent {inv.sentAt}
                                                    </div>
                                                </div>
                                            </div>
                                            <Tag className="bg-amber-50 dark:bg-amber-500/10">
                                                <span className="text-xs font-medium text-amber-600">
                                                    Pending
                                                </span>
                                            </Tag>
                                        </div>
                                    ))}
                                </div>
                            </Card>
                        )}
                    </>
                )}
            </div>

            <InviteModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                userId={userId}
            />
        </>
    )
}
