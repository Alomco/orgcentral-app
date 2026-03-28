import Container from '@/components/shared/Container'
import AdaptiveCard from '@/components/shared/AdaptiveCard'
import Card from '@/components/ui/Card'
import Skeleton from '@/components/ui/Skeleton'

export default function DashboardLoading() {
    return (
        <Container>
            <AdaptiveCard>
                <div className="flex flex-col gap-6">
                    <div>
                        <Skeleton height={28} width={250} />
                        <Skeleton height={14} width={180} className="mt-2" />
                    </div>
                    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <Card key={i} bodyClass="p-5">
                                <Skeleton height={14} width={80} />
                                <Skeleton height={32} width={40} className="mt-2" />
                            </Card>
                        ))}
                    </div>
                    <div className="grid gap-6 lg:grid-cols-2">
                        {Array.from({ length: 2 }).map((_, i) => (
                            <Card key={i} bodyClass="p-6">
                                <Skeleton height={18} width={160} />
                                <div className="mt-4 space-y-3">
                                    {Array.from({ length: 3 }).map((_, j) => (
                                        <Skeleton key={j} height={48} />
                                    ))}
                                </div>
                            </Card>
                        ))}
                    </div>
                </div>
            </AdaptiveCard>
        </Container>
    )
}
