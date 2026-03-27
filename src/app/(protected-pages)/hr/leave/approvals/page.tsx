import { auth } from '@/auth'
import { getLeaveRequestsForApproval } from '@/server/actions/hr/getLeaveRequestsForApproval'
import LeaveApprovalsView from './_components/LeaveApprovalsView'

export default async function HrLeaveApprovalsPage() {
    const session = await auth()
    const userId = session?.user?.id

    if (!userId) {
        return (
            <div className="space-y-6 p-6">
                <h1 className="text-2xl font-semibold">Leave Approvals</h1>
                <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                    <p className="text-gray-500">
                        You must be signed in to view approvals.
                    </p>
                </div>
            </div>
        )
    }

    let requests
    try {
        requests = await getLeaveRequestsForApproval(userId)
    } catch {
        return (
            <div className="space-y-6 p-6">
                <h1 className="text-2xl font-semibold">Leave Approvals</h1>
                <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                    <p className="text-gray-500">
                        Something went wrong loading approvals. Please sign out and sign back in.
                    </p>
                </div>
            </div>
        )
    }

    return <LeaveApprovalsView requests={requests} userId={userId} />
}
