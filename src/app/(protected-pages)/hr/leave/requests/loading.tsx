import Container from '@/components/shared/Container'
import AdaptiveCard from '@/components/shared/AdaptiveCard'
import Card from '@/components/ui/Card'
import Skeleton from '@/components/ui/Skeleton'
import Table from '@/components/ui/Table'
import TableRowSkeleton from '@/components/shared/loaders/TableRowSkeleton'

const { THead, Th, Tr } = Table

export default function HrLeaveRequestsLoading() {
    return (
        <Container>
            <AdaptiveCard>
                <div className="flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                        <Skeleton height={28} width={120} />
                        <Skeleton height={36} width={140} />
                    </div>
                    <div className="grid grid-cols-2 gap-4 xl:grid-cols-5">
                        {Array.from({ length: 5 }).map((_, i) => (
                            <Card key={i} bodyClass="p-4">
                                <Skeleton height={14} width={60} className="mb-2" />
                                <Skeleton height={28} width={40} />
                            </Card>
                        ))}
                    </div>
                    <Table>
                        <THead>
                            <Tr>
                                <Th>Type</Th>
                                <Th>Dates</Th>
                                <Th>Days</Th>
                                <Th>Status</Th>
                                <Th>Submitted</Th>
                                <Th>Approver</Th>
                            </Tr>
                        </THead>
                        <TableRowSkeleton columns={6} rows={5} />
                    </Table>
                </div>
            </AdaptiveCard>
        </Container>
    )
}
