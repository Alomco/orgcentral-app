import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { updateOrgBranding } from '@/server/actions/org/updateOrgBranding'

export async function POST(request: Request) {
    const session = await auth()
    if (!session?.user?.id) {
        return NextResponse.json({ success: false, error: 'Not signed in.' }, { status: 401 })
    }

    const body = await request.json()

    const result = await updateOrgBranding({
        userId: session.user.id,
        brandColour: body.brandColour,
        logoUrl: body.logoUrl,
    })

    return NextResponse.json(result, { status: result.success ? 200 : 400 })
}
