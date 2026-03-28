import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { approveLeaveRequest } from '@/server/actions/hr/approveLeaveRequest'

export async function POST(request: Request) {
    const session = await auth()
    if (!session?.user?.id) {
        return NextResponse.json({ success: false, error: 'Not signed in.' }, { status: 401 })
    }

    const body = await request.json()

    const result = await approveLeaveRequest({
        requestId: body.requestId,
        approverId: session.user.id,
        action: body.action,
        note: body.note,
    })

    return NextResponse.json(result, { status: result.success ? 200 : 400 })
}
