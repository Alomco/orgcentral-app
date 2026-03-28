import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { updateProfile } from '@/server/actions/profile/updateProfile'

export async function POST(request: Request) {
    const session = await auth()
    if (!session?.user?.id) {
        return NextResponse.json({ success: false, error: 'Not signed in.' }, { status: 401 })
    }

    const body = await request.json()

    const result = await updateProfile({
        userId: session.user.id,
        firstName: body.firstName,
        lastName: body.lastName,
        jobTitle: body.jobTitle,
        phone: body.phone,
    })

    return NextResponse.json(result, { status: result.success ? 200 : 400 })
}
