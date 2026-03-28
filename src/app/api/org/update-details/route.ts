import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { updateOrgDetails } from '@/server/actions/org/updateOrgDetails'

export async function POST(request: Request) {
    const session = await auth()
    if (!session?.user?.id) {
        return NextResponse.json({ success: false, error: 'Not signed in.' }, { status: 401 })
    }

    const body = await request.json()

    const result = await updateOrgDetails({
        userId: session.user.id,
        name: body.name,
        sector: body.sector,
        size: body.size,
    })

    return NextResponse.json(result, { status: result.success ? 200 : 400 })
}
