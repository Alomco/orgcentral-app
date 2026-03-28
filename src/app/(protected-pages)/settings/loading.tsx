export default function SettingsLoading() {
    return (
        <div className="space-y-6 p-6">
            <div className="h-8 w-40 animate-pulse rounded-lg bg-gray-200" />
            {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                    <div className="h-5 w-32 animate-pulse rounded bg-gray-200" />
                    <div className="mt-6 grid gap-4 sm:grid-cols-2">
                        <div className="h-16 animate-pulse rounded-xl bg-gray-100" />
                        <div className="h-16 animate-pulse rounded-xl bg-gray-100" />
                    </div>
                </div>
            ))}
        </div>
    )
}
