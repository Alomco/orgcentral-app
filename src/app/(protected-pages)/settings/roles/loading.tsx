export default function RolesLoading() {
    return (
        <div className="space-y-6 p-6">
            <div className="flex items-start justify-between">
                <div className="h-8 w-32 animate-pulse rounded-lg bg-gray-200" />
                <div className="h-10 w-28 animate-pulse rounded-xl bg-gray-200" />
            </div>
            <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="h-20 animate-pulse rounded-2xl bg-gray-100" />
                ))}
            </div>
        </div>
    )
}
