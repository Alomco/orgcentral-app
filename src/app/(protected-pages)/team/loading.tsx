import Container from '@/components/shared/Container'
import AdaptiveCard from '@/components/shared/AdaptiveCard'
import Skeleton from '@/components/ui/Skeleton'
import Table from '@/components/ui/Table'
import TableRowSkeleton from '@/components/shared/loaders/TableRowSkeleton'

const { THead, Th, Tr } = Table

export default function TeamLoading() {
    return (
        <Container>
            <AdaptiveCard>
                <div className="flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                        <Skeleton height={28} width={120} />
                        <Skeleton height={36} width={140} />
                    </div>
                    <Table>
                        <THead>
                            <Tr>
                                <Th>Name</Th>
                                <Th>Email</Th>
                                <Th>Role</Th>
                                <Th>Joined</Th>
                                <Th>Actions</Th>
                            </Tr>
                        </THead>
                        <TableRowSkeleton columns={5} rows={4} avatarInColumns={[0]} />
                    </Table>
                </div>
            </AdaptiveCard>
        </Container>
    )
}
