'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { TeamMemberRow } from '@/server/actions/team/getTeamMembers'
import type { PendingInvitationRow } from '@/server/actions/team/getPendingInvitations'
import type { RoleRow } from '@/server/actions/roles/getRoles'

interface TeamViewProps {
    members: TeamMemberRow[]
    invitations: PendingInvitationRow[]
    userId: string
    roles: RoleRow[]
    isAdmin: boolean
}

export default function TeamView({ members, invitations, userId, roles, isAdmin }: TeamViewProps) {
    const [isModalOpen, setIsModalOpen] = useState(false)
    const isJustYou = members.length <= 1 && invitations.length === 0

    return (
        <>
            <div className="space-y-6 p-6">
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-semibold">Your team</h1>
                        <p className="text-sm text-gray-500">
                            {isJustYou
                                ? 'Invite people to join your organisation.'
                                : `${members.length} member${members.length !== 1 ? 's' : ''}`}
                        </p>
                    </div>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="rounded-xl bg-primary px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:opacity-90"
                    >
                        Invite someone
                    </button>
                </div>

                {isJustYou ? (
                    <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm">
                        <p className="text-lg font-medium text-gray-900">
                            Your team is just you for now
                        </p>
                        <p className="mt-2 text-sm text-gray-500">
                            Invite your first team member to get started.
                        </p>
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="mt-4 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:opacity-90"
                        >
                            Invite someone
                        </button>
                    </div>
                ) : (
                    <>
                        {/* Members table */}
                        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
                            <div className="border-b border-gray-200 p-4">
                                <h2 className="text-lg font-medium">Members</h2>
                            </div>

                            {/* Desktop */}
                            <div className="hidden overflow-x-auto md:block">
                                <table className="min-w-full text-left text-sm">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-4 py-3 font-medium">Name</th>
                                            <th className="px-4 py-3 font-medium">Email</th>
                                            <th className="px-4 py-3 font-medium">Role</th>
                                            <th className="px-4 py-3 font-medium">Joined</th>
                                            {isAdmin && <th className="px-4 py-3 font-medium text-right">Actions</th>}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {members.map((m) => (
                                            <MemberRow key={m.id} member={m} roles={roles} isAdmin={isAdmin} userId={userId} />
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Mobile */}
                            <div className="block p-4 md:hidden">
                                <div className="space-y-3">
                                    {members.map((m) => (
                                        <div key={m.id} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                                            <div className="flex items-start justify-between">
                                                <div className="font-medium">{m.name}</div>
                                                <span className="inline-flex rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600">
                                                    {m.role}
                                                </span>
                                            </div>
                                            <div className="mt-1 text-sm text-gray-500">{m.email}</div>
                                            <div className="mt-1 text-xs text-gray-400">Joined {m.joinedAt}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Pending invitations */}
                        {invitations.length > 0 && (
                            <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
                                <div className="border-b border-gray-200 p-4">
                                    <h2 className="text-lg font-medium">
                                        Pending invitations ({invitations.length})
                                    </h2>
                                </div>
                                <div className="p-4">
                                    <div className="space-y-3">
                                        {invitations.map((inv) => (
                                            <div
                                                key={inv.token}
                                                className="flex items-center justify-between rounded-xl border border-dashed border-gray-300 bg-gray-50 px-4 py-3"
                                            >
                                                <div>
                                                    <div className="text-sm font-medium text-gray-700">
                                                        {inv.email}
                                                    </div>
                                                    <div className="text-xs text-gray-400">
                                                        {inv.role} · Sent {inv.sentAt}
                                                    </div>
                                                </div>
                                                <span className="inline-flex rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-amber-600 ring-1 ring-amber-200">
                                                    Pending
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>

            {isModalOpen && (
                <InviteModal
                    userId={userId}
                    onClose={() => setIsModalOpen(false)}
                />
            )}
        </>
    )
}

function InviteModal({
    userId,
    onClose,
}: {
    userId: string
    onClose: () => void
}) {
    const router = useRouter()
    const [isPending, setIsPending] = useState(false)
    const [email, setEmail] = useState('')
    const [name, setName] = useState('')
    const [role, setRole] = useState<'Staff' | 'Manager'>('Staff')
    const [error, setError] = useState<string | null>(null)
    const [step, setStep] = useState<'form' | 'confirm'>('form')

    const canProceed = email.trim().includes('@')

    const handleConfirmSend = async () => {
        setError(null)
        setIsPending(true)

        try {
            const response = await fetch('/api/team/invite', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    inviterUserId: userId,
                    email: email.trim(),
                    name: name.trim() || undefined,
                    role,
                }),
            })

            const result = await response.json()

            if (!result.success) {
                setError(result.error ?? 'Something went wrong.')
                setStep('form')
                return
            }

            onClose()
            router.refresh()
        } catch {
            setError('Something went wrong. Please try again.')
            setStep('form')
        } finally {
            setIsPending(false)
        }
    }

    const inputClass =
        'block w-full rounded-xl border border-gray-300 px-3 py-2 text-sm shadow-sm outline-none focus:border-primary'

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white shadow-xl">
                <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
                    <div>
                        <h3 className="text-lg font-semibold">Invite someone</h3>
                        <p className="text-sm text-gray-500">
                            {step === 'form'
                                ? 'They\u2019ll get an email with a link to join.'
                                : 'Check the details before sending.'}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="rounded-lg px-2 py-1 text-xl text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                        aria-label="Close"
                    >
                        ×
                    </button>
                </div>

                <div className="space-y-4 px-6 py-5">
                    {error && (
                        <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                            {error}
                        </div>
                    )}

                    {step === 'form' ? (
                        <>
                            <div>
                                <label htmlFor="inviteEmail" className="mb-1 block text-sm font-medium text-gray-700">
                                    Email address <span className="text-red-500">*</span>
                                </label>
                                <input
                                    id="inviteEmail"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className={inputClass}
                                    placeholder="colleague@example.com"
                                    autoFocus
                                />
                            </div>

                            <div>
                                <label htmlFor="inviteName" className="mb-1 block text-sm font-medium text-gray-700">
                                    Name (optional)
                                </label>
                                <input
                                    id="inviteName"
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className={inputClass}
                                    placeholder="e.g. Sarah Johnson"
                                />
                            </div>

                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700">
                                    Role
                                </label>
                                <div className="flex gap-2">
                                    {(['Staff', 'Manager'] as const).map((r) => (
                                        <button
                                            key={r}
                                            type="button"
                                            onClick={() => setRole(r)}
                                            className={`rounded-xl border px-3 py-1.5 text-sm font-medium transition ${
                                                role === r
                                                    ? 'border-primary bg-primary/10 text-primary'
                                                    : 'border-gray-300 text-gray-600 hover:bg-gray-50'
                                            }`}
                                        >
                                            {r}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="flex items-center justify-end gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="rounded-xl border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setStep('confirm')}
                                    disabled={!canProceed}
                                    className="rounded-xl bg-primary px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:opacity-90 disabled:opacity-50"
                                >
                                    Review invitation
                                </button>
                            </div>
                        </>
                    ) : (
                        <>
                            {/* Confirmation summary */}
                            <div className="rounded-xl bg-gray-50 p-4 text-sm">
                                <p className="text-gray-900">
                                    Send an invitation to{' '}
                                    <span className="font-semibold">{email}</span>
                                    {name && ` (${name})`}
                                    {' '}as a <span className="font-semibold">{role}</span>?
                                </p>
                                <p className="mt-1 text-gray-500">
                                    They'll receive an email with a link to create their account.
                                </p>
                            </div>

                            <div className="flex items-center justify-end gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setStep('form')}
                                    disabled={isPending}
                                    className="rounded-xl border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                                >
                                    Back
                                </button>
                                <button
                                    type="button"
                                    onClick={handleConfirmSend}
                                    disabled={isPending}
                                    className="rounded-xl bg-primary px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:opacity-90 disabled:opacity-50"
                                >
                                    {isPending ? 'Sending...' : 'Send invitation'}
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}

const ROLE_DISPLAY: Record<string, string> = {
    orgAdmin: 'Admin',
    manager: 'Manager',
    member: 'Staff',
}

function MemberRow({
    member,
    roles,
    isAdmin,
    userId,
}: {
    member: TeamMemberRow
    roles: RoleRow[]
    isAdmin: boolean
    userId: string
}) {
    const router = useRouter()
    const [changing, setChanging] = useState(false)
    const [isPending, setIsPending] = useState(false)
    const isSelf = member.id === userId

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

    return (
        <tr className="border-t border-gray-100">
            <td className="px-4 py-3 font-medium">{member.name}</td>
            <td className="px-4 py-3 text-gray-500">{member.email}</td>
            <td className="px-4 py-3">
                <span className="inline-flex rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600">
                    {member.role}
                </span>
            </td>
            <td className="px-4 py-3 text-gray-500">{member.joinedAt}</td>
            {isAdmin && (
                <td className="px-4 py-3 text-right">
                    {isSelf ? (
                        <span className="text-xs text-gray-400">You</span>
                    ) : changing ? (
                        <select
                            value={member.roleId}
                            onChange={(e) => handleChangeRole(e.target.value)}
                            disabled={isPending}
                            className="rounded-lg border border-gray-300 px-2 py-1 text-xs"
                            autoFocus
                            onBlur={() => !isPending && setChanging(false)}
                        >
                            {roles.map((r) => (
                                <option key={r.id} value={r.id}>
                                    {ROLE_DISPLAY[r.name] ?? r.name}
                                </option>
                            ))}
                        </select>
                    ) : (
                        <button
                            onClick={() => setChanging(true)}
                            className="rounded-lg border border-gray-300 px-2.5 py-1 text-xs font-medium text-gray-600 transition hover:bg-gray-50"
                        >
                            Change role
                        </button>
                    )}
                </td>
            )}
        </tr>
    )
}
