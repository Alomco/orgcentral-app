import Link from 'next/link'
import { auth } from '@/auth'
import { redirect } from 'next/navigation'

export default async function LandingPage() {
    const session = await auth()
    if (session?.user) {
        redirect('/home')
    }

    return (
        <div className="min-h-screen bg-white text-gray-900">
            {/* Header */}
            <header className="sticky top-0 z-40 border-b border-gray-100 bg-white/90 backdrop-blur-sm">
                <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
                    <div className="text-lg font-bold" style={{ color: '#005EB8' }}>
                        OrgCentral
                    </div>
                    <div className="flex items-center gap-4">
                        <Link
                            href="/sign-in"
                            className="text-sm font-medium text-gray-600 hover:text-gray-900"
                        >
                            Sign in
                        </Link>
                        <Link
                            href="/sign-up"
                            className="rounded-xl px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:opacity-90"
                            style={{ backgroundColor: '#005EB8' }}
                        >
                            Get started free
                        </Link>
                    </div>
                </div>
            </header>

            {/* Hero */}
            <section className="mx-auto max-w-5xl px-6 py-16 sm:py-24">
                <div className="mx-auto max-w-2xl text-center">
                    <div
                        className="mb-6 inline-block rounded-full border px-4 py-1.5 text-xs font-medium"
                        style={{ borderColor: '#005EB8', color: '#005EB8', backgroundColor: '#005EB80a' }}
                    >
                        Now in early access — free for NHS teams
                    </div>
                    <h1 className="text-3xl font-bold leading-tight tracking-tight sm:text-4xl lg:text-5xl">
                        Management made simple — built for public sector teams
                    </h1>
                    <p className="mt-6 text-lg leading-relaxed text-gray-500">
                        OrgCentral gives NHS, local authority, and education teams a friendly
                        platform to manage HR, staff, and operations. No complexity.
                        No jargon. Just tools that work.
                    </p>
                    <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
                        <Link
                            href="/sign-up"
                            className="w-full rounded-xl px-6 py-3 text-center text-sm font-medium text-white shadow-sm transition hover:opacity-90 sm:w-auto"
                            style={{ backgroundColor: '#005EB8' }}
                        >
                            Get started free
                        </Link>
                        <a
                            href="#features"
                            className="w-full rounded-xl border border-gray-300 px-6 py-3 text-center text-sm font-medium text-gray-700 transition hover:bg-gray-50 sm:w-auto"
                        >
                            See how it works
                        </a>
                    </div>
                </div>
            </section>

            {/* Social proof bar */}
            <section className="border-y border-gray-100 bg-gray-50">
                <div className="mx-auto max-w-5xl px-6 py-8">
                    <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:justify-center sm:gap-8">
                        <p className="text-sm font-medium text-gray-600">
                            Built by a NHS PCN manager, for public sector teams
                        </p>
                        <div className="hidden h-4 w-px bg-gray-300 sm:block" />
                        <p className="text-sm text-gray-500">
                            Designed with DSPT compliance in mind
                        </p>
                    </div>
                </div>
            </section>

            {/* Features — what's available now */}
            <section id="features" className="mx-auto max-w-5xl px-6 py-16 sm:py-20">
                <div className="mx-auto max-w-2xl text-center">
                    <h2 className="text-2xl font-bold sm:text-3xl">
                        What's available today
                    </h2>
                    <p className="mt-3 text-gray-500">
                        Real tools you can use right now — no waiting list, no demo required.
                    </p>
                </div>
                <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    <FeatureCard
                        title="Annual leave management"
                        description="Staff request time off, managers approve it. Simple, fast, paperless."
                    />
                    <FeatureCard
                        title="Leave approvals"
                        description="Approve or decline requests in seconds, from any device."
                    />
                    <FeatureCard
                        title="Multi-organisation"
                        description="Work across multiple organisations? Switch between them instantly."
                    />
                </div>
            </section>

            {/* Coming soon */}
            <section className="border-y border-gray-100 bg-gray-50">
                <div className="mx-auto max-w-5xl px-6 py-16 sm:py-20">
                    <div className="mx-auto max-w-2xl text-center">
                        <h2 className="text-2xl font-bold sm:text-3xl">
                            What's coming next
                        </h2>
                        <p className="mt-3 text-gray-500">
                            We're building these modules now. Early access users get them first.
                        </p>
                    </div>
                    <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {[
                            'Rota management',
                            'Absence tracking',
                            'Policy centre',
                            'Compliance tools',
                            'Performance management',
                        ].map((item) => (
                            <div
                                key={item}
                                className="rounded-xl border border-dashed border-gray-300 bg-white px-5 py-4 text-center text-sm font-medium text-gray-500"
                            >
                                {item}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Pricing */}
            <section className="mx-auto max-w-5xl px-6 py-16 sm:py-20">
                <div className="mx-auto max-w-2xl text-center">
                    <h2 className="text-2xl font-bold sm:text-3xl">
                        Simple, honest pricing
                    </h2>
                    <p className="mt-3 text-gray-500">
                        No surprises. No per-feature charges. No credit card needed to get started.
                    </p>
                </div>
                <div className="mt-12 grid gap-6 sm:grid-cols-2">
                    <div className="rounded-2xl border-2 border-gray-200 bg-white p-8">
                        <div className="text-xs font-medium uppercase tracking-wide text-gray-400">
                            Free forever
                        </div>
                        <div className="mt-2 text-2xl font-bold">£0</div>
                        <p className="mt-3 text-sm text-gray-500">
                            Annual leave management — request, approve, and track time off for your whole team.
                        </p>
                        <Link
                            href="/sign-up"
                            className="mt-6 block rounded-xl border border-gray-300 px-4 py-2.5 text-center text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                        >
                            Start for free
                        </Link>
                    </div>
                    <div
                        className="rounded-2xl border-2 p-8"
                        style={{ borderColor: '#005EB8' }}
                    >
                        <div
                            className="text-xs font-medium uppercase tracking-wide"
                            style={{ color: '#005EB8' }}
                        >
                            HR Module
                        </div>
                        <div className="mt-2 text-2xl font-bold">
                            £1{' '}
                            <span className="text-base font-normal text-gray-400">
                                per user / month
                            </span>
                        </div>
                        <p className="mt-3 text-sm text-gray-500">
                            Full HR suite — leave, absences, compliance, onboarding, performance, and more.
                        </p>
                        <Link
                            href="/sign-up"
                            className="mt-6 block rounded-xl px-4 py-2.5 text-center text-sm font-medium text-white transition hover:opacity-90"
                            style={{ backgroundColor: '#005EB8' }}
                        >
                            Get started free
                        </Link>
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section
                className="border-t border-gray-100"
                style={{ backgroundColor: '#005EB808' }}
            >
                <div className="mx-auto max-w-5xl px-6 py-16 sm:py-20">
                    <div className="mx-auto max-w-2xl text-center">
                        <h2 className="text-2xl font-bold sm:text-3xl">
                            Join the early access programme
                        </h2>
                        <p className="mt-3 text-gray-500">
                            Be among the first NHS and public sector teams to use OrgCentral.
                            It's free to get started and takes less than two minutes.
                        </p>
                        <Link
                            href="/sign-up"
                            className="mt-8 inline-block rounded-xl px-8 py-3 text-sm font-medium text-white shadow-sm transition hover:opacity-90"
                            style={{ backgroundColor: '#005EB8' }}
                        >
                            Create your free account
                        </Link>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="border-t border-gray-100 bg-white">
                <div className="mx-auto max-w-5xl px-6 py-8">
                    <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
                        <div className="text-sm text-gray-400">
                            OrgCentral — Management made simple
                        </div>
                        <div className="flex gap-6 text-sm text-gray-400">
                            <Link href="/sign-in" className="hover:text-gray-600">
                                Sign in
                            </Link>
                            <Link href="/sign-up" className="hover:text-gray-600">
                                Sign up
                            </Link>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    )
}

function FeatureCard({
    title,
    description,
}: {
    title: string
    description: string
}) {
    return (
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <h3 className="text-base font-semibold text-gray-900">{title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-gray-500">
                {description}
            </p>
        </div>
    )
}
