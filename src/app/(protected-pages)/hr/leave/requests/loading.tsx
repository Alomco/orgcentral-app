export default function HrLeaveRequestsLoading() {
    return (
        <div className="space-y-6 p-6">
            <div>
                <div className="h-8 w-56 animate-pulse rounded-lg bg-gray-200" />
                <div className="mt-2 h-4 w-72 animate-pulse rounded bg-gray-100" />
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
                {Array.from({ length: 5 }).map((_, i) => (
                    <div
                        key={i}
                        className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm"
                    >
                        <div className="h-4 w-16 animate-pulse rounded bg-gray-100" />
                        <div className="mt-3 h-7 w-10 animate-pulse rounded bg-gray-200" />
                    </div>
                ))}
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                <div className="h-5 w-32 animate-pulse rounded bg-gray-200" />
                <div className="mt-4 space-y-3">
                    {Array.from({ length: 3 }).map((_, i) => (
                        <div
                            key={i}
                            className="h-10 animate-pulse rounded bg-gray-100"
                        />
                    ))}
                </div>
            </div>
        </div>
    )
}
