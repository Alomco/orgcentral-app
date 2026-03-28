export default function TeamLoading() {
    return (
        <div className="space-y-6 p-6">
            <div className="flex items-start justify-between">
                <div>
                    <div className="h-8 w-40 animate-pulse rounded-lg bg-gray-200" />
                    <div className="mt-2 h-4 w-56 animate-pulse rounded bg-gray-100" />
                </div>
                <div className="h-10 w-36 animate-pulse rounded-xl bg-gray-200" />
            </div>
            <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
                <div className="p-4 space-y-3">
                    {Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="h-14 animate-pulse rounded-xl bg-gray-100" />
                    ))}
                </div>
            </div>
        </div>
    )
}
