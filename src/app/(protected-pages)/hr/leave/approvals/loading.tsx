export default function HrLeaveApprovalsLoading() {
    return (
        <div className="space-y-6 p-6">
            <div>
                <div className="h-8 w-48 animate-pulse rounded-lg bg-gray-200" />
                <div className="mt-2 h-4 w-64 animate-pulse rounded bg-gray-100" />
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
                <div className="border-b border-gray-200 p-4">
                    <div className="h-5 w-40 animate-pulse rounded bg-gray-200" />
                </div>
                <div className="p-4 space-y-3">
                    {Array.from({ length: 3 }).map((_, i) => (
                        <div
                            key={i}
                            className="h-16 animate-pulse rounded-xl bg-gray-100"
                        />
                    ))}
                </div>
            </div>
        </div>
    )
}
