import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { changePassword } from '@/server/actions/profile/changePassword'

export async function POST(request: Request) {
    const session = await auth()
    if (!session?.user?.id) {
        return NextResponse.json({ success: false, error: 'Not signed in.' }, { status: 401 })
    }

    const body = await request.json()

    const result = await changePassword({
        userId: session.user.id,
        currentPassword: body.currentPassword,
        newPassword: body.newPassword,
    })

    return NextResponse.json(result, { status: result.success ? 200 : 400 })
}
