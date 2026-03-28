import Container from '@/components/shared/Container'
import AdaptiveCard from '@/components/shared/AdaptiveCard'
import Card from '@/components/ui/Card'
import Skeleton from '@/components/ui/Skeleton'

export default function ProfileLoading() {
    return (
        <Container>
            <AdaptiveCard>
                <div className="flex flex-col gap-6">
                    <div className="flex items-center gap-4">
                        <Skeleton variant="circle" height={56} width={56} />
                        <div>
                            <Skeleton height={28} width={160} />
                            <Skeleton height={14} width={200} className="mt-1" />
                        </div>
                    </div>
                    <div className="flex gap-2">
                        {Array.from({ length: 3 }).map((_, i) => (
                            <Skeleton key={i} height={36} width={100} />
                        ))}
                    </div>
                    <Card bodyClass="p-6">
                        <Skeleton height={18} width={140} />
                        <div className="mt-5 grid gap-4 sm:grid-cols-2">
                            {Array.from({ length: 4 }).map((_, i) => (
                                <div key={i}>
                                    <Skeleton height={14} width={80} />
                                    <Skeleton height={40} className="mt-2" />
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>
            </AdaptiveCard>
        </Container>
    )
}
