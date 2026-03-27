import { auth } from '@/auth'
import { getLeaveRequests } from '@/server/actions/hr/getLeaveRequests'
import { getLeavePolicies } from '@/server/actions/hr/getLeavePolicies'
import LeaveRequestsView from './_components/LeaveRequestsView'

export default async function HrLeaveRequestsPage() {
    const session = await auth()
    const userId = session?.user?.id

    if (!userId) {
        return (
            <div className="space-y-6 p-6">
                <h1 className="text-2xl font-semibold">HR Leave Requests</h1>
                <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                    <p className="text-gray-500">
                        You must be signed in to view leave requests.
                    </p>
                </div>
            </div>
        )
    }

    let requests, summary, policies
    try {
        const [requestsResult, policiesResult] = await Promise.all([
            getLeaveRequests(userId),
            getLeavePolicies(userId),
        ])
        requests = requestsResult.requests
        summary = requestsResult.summary
        policies = policiesResult
    } catch {
        return (
            <div className="space-y-6 p-6">
                <h1 className="text-2xl font-semibold">HR Leave Requests</h1>
                <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                    <p className="text-gray-500">
                        Unable to load leave requests. Please sign out and sign back in.
                    </p>
                </div>
            </div>
        )
    }

    return (
        <LeaveRequestsView
            initialRequests={requests}
            summary={summary}
            policies={policies}
            userId={userId}
        />
    )
}
