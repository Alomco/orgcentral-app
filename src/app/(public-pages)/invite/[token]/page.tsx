import { prisma } from '@/server/lib/prisma'
import AcceptInviteForm from './_components/AcceptInviteForm'
import Link from 'next/link'

interface Props {
    params: Promise<{ token: string }>
}

export default async function InviteAcceptPage({ params }: Props) {
    const { token } = await params

    const invitation = await prisma.invitation.findUnique({
        where: { token },
        select: {
            token: true,
            targetEmail: true,
            organizationName: true,
            status: true,
            expiresAt: true,
            invitedBy: { select: { displayName: true } },
        },
    })

    if (!invitation) {
        return (
            <div className="orgcentral-brand flex min-h-screen items-center justify-center bg-gray-50 p-4">
                <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm">
                    <h1 className="text-xl font-semibold text-gray-900">
                        Invitation not found
                    </h1>
                    <p className="mt-2 text-sm text-gray-500">
                        This invitation link is not valid. It may have been removed or the
                        link is incorrect. Please ask the person who invited you to send a
                        new one.
                    </p>
                    <Link
                        href="/sign-in"
                        className="mt-6 inline-block rounded-xl bg-primary px-4 py-2 text-sm font-medium text-white transition hover:opacity-90"
                    >
                        Go to sign in
                    </Link>
                </div>
            </div>
        )
    }

    if (invitation.status !== 'pending') {
        return (
            <div className="orgcentral-brand flex min-h-screen items-center justify-center bg-gray-50 p-4">
                <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm">
                    <h1 className="text-xl font-semibold text-gray-900">
                        Invitation already used
                    </h1>
                    <p className="mt-2 text-sm text-gray-500">
                        This invitation has already been accepted. If you already have an
                        account, you can sign in below.
                    </p>
                    <Link
                        href="/sign-in"
                        className="mt-6 inline-block rounded-xl bg-primary px-4 py-2 text-sm font-medium text-white transition hover:opacity-90"
                    >
                        Sign in
                    </Link>
                </div>
            </div>
        )
    }

    if (invitation.expiresAt && invitation.expiresAt < new Date()) {
        return (
            <div className="orgcentral-brand flex min-h-screen items-center justify-center bg-gray-50 p-4">
                <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm">
                    <h1 className="text-xl font-semibold text-gray-900">
                        Invitation expired
                    </h1>
                    <p className="mt-2 text-sm text-gray-500">
                        This invitation has expired. Please ask{' '}
                        {invitation.invitedBy?.displayName ?? 'your manager'} to send you a
                        new one.
                    </p>
                    <Link
                        href="/sign-in"
                        className="mt-6 inline-block rounded-xl bg-primary px-4 py-2 text-sm font-medium text-white transition hover:opacity-90"
                    >
                        Go to sign in
                    </Link>
                </div>
            </div>
        )
    }

    const inviterName = invitation.invitedBy?.displayName ?? 'A colleague'

    return (
        <AcceptInviteForm
            token={token}
            email={invitation.targetEmail}
            orgName={invitation.organizationName}
            inviterName={inviterName}
        />
    )
}
