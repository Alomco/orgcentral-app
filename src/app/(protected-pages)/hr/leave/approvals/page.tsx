import { auth } from '@/auth'
import { getLeaveRequestsForApproval } from '@/server/actions/hr/getLeaveRequestsForApproval'
import Container from '@/components/shared/Container'
import AdaptiveCard from '@/components/shared/AdaptiveCard'
import LeaveApprovalsView from './_components/LeaveApprovalsView'

export default async function HrLeaveApprovalsPage() {
    const session = await auth()
    const userId = session?.user?.id

    if (!userId) {
        return (
            <Container>
                <AdaptiveCard>
                    <h3>Leave Approvals</h3>
                    <p className="mt-2 text-gray-500">
                        You must be signed in to view approvals.
                    </p>
                </AdaptiveCard>
            </Container>
        )
    }

    let requests
    try {
        requests = await getLeaveRequestsForApproval(userId)
    } catch {
        return (
            <Container>
                <AdaptiveCard>
                    <h3>Leave Approvals</h3>
                    <p className="mt-2 text-gray-500">
                        Something went wrong loading approvals. Please sign out and sign back in.
                    </p>
                </AdaptiveCard>
            </Container>
        )
    }

    return (
        <Container>
            <AdaptiveCard>
                <LeaveApprovalsView requests={requests} userId={userId} />
            </AdaptiveCard>
        </Container>
    )
}
