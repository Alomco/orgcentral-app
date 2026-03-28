import Container from '@/components/shared/Container'
import AdaptiveCard from '@/components/shared/AdaptiveCard'
import Skeleton from '@/components/ui/Skeleton'
import Table from '@/components/ui/Table'
import TableRowSkeleton from '@/components/shared/loaders/TableRowSkeleton'

const { THead, Th, Tr } = Table

export default function HrLeaveApprovalsLoading() {
    return (
        <Container>
            <AdaptiveCard>
                <div className="flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                        <Skeleton height={28} width={160} />
                        <Skeleton height={14} width={100} />
                    </div>
                    <Table>
                        <THead>
                            <Tr>
                                <Th>Employee</Th>
                                <Th>Leave type</Th>
                                <Th>Dates</Th>
                                <Th>Duration</Th>
                                <Th>Reason</Th>
                                <Th>Submitted</Th>
                                <Th>Actions</Th>
                            </Tr>
                        </THead>
                        <TableRowSkeleton columns={7} rows={5} />
                    </Table>
                </div>
            </AdaptiveCard>
        </Container>
    )
}
