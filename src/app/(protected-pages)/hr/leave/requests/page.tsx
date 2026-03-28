import { auth } from '@/auth'
import { getLeaveRequests } from '@/server/actions/hr/getLeaveRequests'
import { getLeavePolicies } from '@/server/actions/hr/getLeavePolicies'
import Container from '@/components/shared/Container'
import AdaptiveCard from '@/components/shared/AdaptiveCard'
import LeaveRequestsView from './_components/LeaveRequestsView'

export default async function HrLeaveRequestsPage() {
    const session = await auth()
    const userId = session?.user?.id

    if (!userId) {
        return (
            <Container>
                <AdaptiveCard>
                    <h3>Time off</h3>
                    <p className="mt-2 text-gray-500">
                        You must be signed in to view leave requests.
                    </p>
                </AdaptiveCard>
            </Container>
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
            <Container>
                <AdaptiveCard>
                    <h3>Time off</h3>
                    <p className="mt-2 text-gray-500">
                        Unable to load leave requests. Please sign out and sign back in.
                    </p>
                </AdaptiveCard>
            </Container>
        )
    }

    return (
        <Container>
            <AdaptiveCard>
                <LeaveRequestsView
                    initialRequests={requests}
                    summary={summary}
                    policies={policies}
                    userId={userId}
                />
            </AdaptiveCard>
        </Container>
    )
}
