import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { deleteRole } from '@/server/actions/roles/deleteRole'

export async function POST(request: Request) {
    const session = await auth()
    if (!session?.user?.id) {
        return NextResponse.json({ success: false, error: 'Not signed in.' }, { status: 401 })
    }
    const body = await request.json()
    const result = await deleteRole({ userId: session.user.id, roleId: body.roleId })
    return NextResponse.json(result, { status: result.success ? 200 : 400 })
}
