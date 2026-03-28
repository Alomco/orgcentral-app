import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { createRole } from '@/server/actions/roles/createRole'

export async function POST(request: Request) {
    const session = await auth()
    if (!session?.user?.id) {
        return NextResponse.json({ success: false, error: 'Not signed in.' }, { status: 401 })
    }
    const body = await request.json()
    const result = await createRole({ userId: session.user.id, ...body })
    return NextResponse.json(result, { status: result.success ? 200 : 400 })
}
