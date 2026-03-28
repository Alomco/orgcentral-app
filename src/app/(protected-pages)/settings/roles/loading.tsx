import Container from '@/components/shared/Container'
import AdaptiveCard from '@/components/shared/AdaptiveCard'
import Card from '@/components/ui/Card'
import Skeleton from '@/components/ui/Skeleton'

export default function RolesLoading() {
    return (
        <Container>
            <AdaptiveCard>
                <div className="flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                        <Skeleton height={28} width={80} />
                        <Skeleton height={36} width={100} />
                    </div>
                    <div className="space-y-3">
                        {Array.from({ length: 3 }).map((_, i) => (
                            <Card key={i} bodyClass="p-5">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <Skeleton height={16} width={100} />
                                        <Skeleton height={12} width={180} className="mt-2" />
                                    </div>
                                    <div className="flex gap-2">
                                        <Skeleton height={28} width={50} />
                                        <Skeleton height={28} width={60} />
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                </div>
            </AdaptiveCard>
        </Container>
    )
}
