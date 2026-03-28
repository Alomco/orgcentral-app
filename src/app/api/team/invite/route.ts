import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { sendInvitation } from '@/server/actions/team/sendInvitation'

export async function POST(request: Request) {
    const session = await auth()
    if (!session?.user?.id) {
        return NextResponse.json(
            { success: false, error: 'Not signed in.' },
            { status: 401 },
        )
    }

    const body = await request.json()

    const result = await sendInvitation({
        inviterUserId: session.user.id,
        email: body.email,
        name: body.name,
        role: body.role ?? 'Staff',
    })

    return NextResponse.json(result, {
        status: result.success ? 200 : 400,
    })
}
