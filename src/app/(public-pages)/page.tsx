import Link from 'next/link'
import { auth } from '@/auth'
import { redirect } from 'next/navigation'

export default async function LandingPage() {
    const session = await auth()
    if (session?.user) {
        redirect('/home')
    }

    return (
        <>
            <style>{`
                @keyframes fade-up {
                    from { opacity: 0; transform: translateY(24px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-up {
                    animation: fade-up 0.7s ease-out both;
                }
                .animate-fade-up-d1 { animation-delay: 0.1s; }
                .animate-fade-up-d2 { animation-delay: 0.2s; }
                .animate-fade-up-d3 { animation-delay: 0.3s; }
                .animate-fade-up-d4 { animation-delay: 0.4s; }
                .animate-fade-up-d5 { animation-delay: 0.5s; }
                @keyframes float {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-8px); }
                }
                .animate-float { animation: float 6s ease-in-out infinite; }
            `}</style>

            <div className="min-h-screen bg-[#001A4E] antialiased" style={{ fontFamily: "'Inter', system-ui, -apple-system, sans-serif" }}>

                {/* ─── NAV ─── */}
                <nav className="sticky top-0 z-50 border-b border-white/10 bg-[#001A4E]/80 backdrop-blur-lg">
                    <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
                        <span className="text-lg font-semibold tracking-tight text-white">
                            OrgCentral
                        </span>
                        <div className="flex items-center gap-5">
                            <Link
                                href="/sign-in"
                                className="text-sm text-white/60 transition hover:text-white"
                            >
                                Sign in
                            </Link>
                            <Link
                                href="/sign-up"
                                className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-[#0066CC] transition hover:bg-white/90"
                            >
                                Start free
                            </Link>
                        </div>
                    </div>
                </nav>

                {/* ─── HERO ─── */}
                <section className="relative overflow-hidden">
                    {/* Subtle radial gradient behind hero */}
                    <div
                        className="pointer-events-none absolute inset-0"
                        style={{
                            background: 'radial-gradient(ellipse 60% 50% at 50% 0%, rgba(0,102,204,0.12) 0%, transparent 70%)',
                        }}
                    />
                    <div className="relative mx-auto max-w-6xl px-6 pb-20 pt-20 sm:pb-28 sm:pt-28">
                        <div className="mx-auto max-w-3xl text-center">
                            {/* Badge */}
                            <div className="animate-fade-up mb-8 inline-flex items-center gap-2 rounded-full border border-[#00A9CE]/30 bg-[#00A9CE]/10 px-4 py-1.5 text-xs text-[#00A9CE]">
                                <span className="h-1.5 w-1.5 rounded-full bg-[#00A9CE]" />
                                Now in early access · Free for public sector teams
                            </div>

                            {/* Headline */}
                            <h1 className="animate-fade-up animate-fade-up-d1 text-4xl font-bold leading-[1.1] tracking-tight text-white sm:text-5xl lg:text-6xl">
                                Run your team.
                                <br />
                                <span className="text-white/40">Not your admin.</span>
                            </h1>

                            {/* Subheading */}
                            <p className="animate-fade-up animate-fade-up-d2 mt-6 text-base leading-relaxed text-white/60 sm:text-lg">
                                OrgCentral gives public sector managers a simpler way to handle
                                HR, leave, and operations — without the complexity or cost of
                                traditional systems.
                            </p>

                            {/* CTAs */}
                            <div className="animate-fade-up animate-fade-up-d3 mt-10 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
                                <Link
                                    href="/sign-up"
                                    className="w-full rounded-lg bg-white px-6 py-3 text-center text-sm font-medium text-[#0066CC] transition hover:bg-white/90 sm:w-auto"
                                >
                                    Start free →
                                </Link>
                                <a
                                    href="#features"
                                    className="w-full rounded-lg border border-white/15 px-6 py-3 text-center text-sm font-medium text-white/70 transition hover:border-white/30 hover:text-white sm:w-auto"
                                >
                                    See what's included
                                </a>
                            </div>
                        </div>

                        {/* Product mockup */}
                        <div className="animate-fade-up animate-fade-up-d4 mx-auto mt-16 max-w-2xl sm:mt-20">
                            <div className="animate-float rounded-2xl border border-white/10 bg-white/[0.05] p-6 shadow-2xl shadow-black/30 backdrop-blur-sm">
                                <div className="mb-4 flex items-center gap-2">
                                    <div className="h-3 w-3 rounded-full bg-white/10" />
                                    <div className="h-3 w-3 rounded-full bg-white/10" />
                                    <div className="h-3 w-3 rounded-full bg-white/10" />
                                    <div className="ml-3 h-3 flex-1 rounded-full bg-white/5" />
                                </div>
                                <div className="grid grid-cols-4 gap-3">
                                    <StatCard label="Pending" value="3" />
                                    <StatCard label="Approved" value="12" />
                                    <StatCard label="This month" value="4" />
                                    <StatCard label="Team" value="8" />
                                </div>
                                <div className="mt-4 space-y-2">
                                    <MockRow name="Sarah J." type="Annual Leave" days="3 days" status="Pending" />
                                    <MockRow name="James T." type="Medical Leave" days="1 day" status="Approved" />
                                    <MockRow name="Priya K." type="Annual Leave" days="5 days" status="Pending" />
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ─── SOCIAL PROOF BAR ─── */}
                <section className="border-y border-white/10 bg-[#003087]">
                    <div className="mx-auto max-w-6xl px-6 py-6">
                        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-white/60">
                            <span>Built for public sector</span>
                            <span className="hidden text-white/30 sm:inline">·</span>
                            <span>DSPT compliant</span>
                            <span className="hidden text-white/30 sm:inline">·</span>
                            <span>Free to start</span>
                            <span className="hidden text-white/30 sm:inline">·</span>
                            <span>No IT team needed</span>
                        </div>
                    </div>
                </section>

                {/* ─── FEATURES ─── */}
                <section id="features" className="bg-white">
                    <div className="mx-auto max-w-6xl px-6 py-20 sm:py-28">
                        <div className="mx-auto max-w-2xl text-center">
                            <div className="mb-3 text-xs font-medium uppercase tracking-widest text-[#0066CC]">
                                What's available now
                            </div>
                            <h2 className="text-2xl font-bold tracking-tight text-[#231F20] sm:text-3xl">
                                Everything a manager actually needs
                            </h2>
                        </div>
                        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                            <FeatureCard
                                emoji="📋"
                                title="Leave management"
                                description="Staff request time off, managers approve it. Simple, paperless, fast."
                            />
                            <FeatureCard
                                emoji="✅"
                                title="Approval queue"
                                description="See every pending request in one place. Approve or decline in seconds."
                            />
                            <FeatureCard
                                emoji="🔄"
                                title="Multi-organisation"
                                description="Work across multiple teams? Switch between them instantly."
                            />
                        </div>
                    </div>
                </section>

                {/* ─── COMING SOON ─── */}
                <section className="bg-[#E8EDEE]">
                    <div className="mx-auto max-w-6xl px-6 py-20 sm:py-28">
                        <div className="mx-auto max-w-2xl text-center">
                            <div className="mb-3 text-xs font-medium uppercase tracking-widest text-[#0066CC]">
                                Coming next
                            </div>
                            <h2 className="text-2xl font-bold tracking-tight text-[#231F20] sm:text-3xl">
                                The full picture is coming
                            </h2>
                        </div>
                        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
                            {[
                                'Rota management',
                                'Absence tracking',
                                'Policy centre',
                                'Compliance tools',
                                'Performance reviews',
                            ].map((item) => (
                                <span
                                    key={item}
                                    className="rounded-full border border-[#0066CC]/20 bg-white px-4 py-2 text-sm font-medium text-[#0066CC]"
                                >
                                    {item}
                                </span>
                            ))}
                        </div>
                        <p className="mt-8 text-center text-sm text-[#231F20]/50">
                            We're building in public. New features ship regularly.
                        </p>
                    </div>
                </section>

                {/* ─── PRICING ─── */}
                <section className="bg-white">
                    <div className="mx-auto max-w-6xl px-6 py-20 sm:py-28">
                        <div className="mx-auto max-w-2xl text-center">
                            <h2 className="text-2xl font-bold tracking-tight text-[#231F20] sm:text-3xl">
                                Simple, honest pricing
                            </h2>
                        </div>
                        <div className="mx-auto mt-14 grid max-w-3xl gap-6 sm:grid-cols-2">
                            {/* Free */}
                            <div className="rounded-2xl border border-[#E8EDEE] bg-white p-8">
                                <div className="text-xs font-medium uppercase tracking-wide text-[#231F20]/40">
                                    Free forever
                                </div>
                                <div className="mt-3 text-4xl font-bold text-[#231F20]">
                                    £0
                                </div>
                                <p className="mt-4 text-sm leading-relaxed text-[#231F20]/60">
                                    Annual leave management — request, approve,
                                    and track time off. No credit card needed.
                                </p>
                                <Link
                                    href="/sign-up"
                                    className="mt-8 block rounded-lg border border-[#0066CC]/30 px-4 py-2.5 text-center text-sm font-medium text-[#0066CC] transition hover:bg-[#0066CC]/5"
                                >
                                    Start free
                                </Link>
                            </div>
                            {/* HR Module */}
                            <div className="rounded-2xl border-2 border-[#003087] bg-[#003087] p-8">
                                <div className="text-xs font-medium uppercase tracking-wide text-white/50">
                                    HR Module
                                </div>
                                <div className="mt-3 text-4xl font-bold text-white">
                                    £1
                                    <span className="ml-1 text-base font-normal text-white/50">
                                        / user / month
                                    </span>
                                </div>
                                <p className="mt-4 text-sm leading-relaxed text-white/60">
                                    Full HR suite — leave, absences, compliance,
                                    onboarding, performance, and more.
                                </p>
                                <Link
                                    href="/sign-up"
                                    className="mt-8 block rounded-lg bg-white px-4 py-2.5 text-center text-sm font-medium text-[#0066CC] transition hover:bg-white/90"
                                >
                                    Start free →
                                </Link>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ─── FINAL CTA ─── */}
                <section className="bg-[#001A4E]">
                    <div className="mx-auto max-w-6xl px-6 py-20 sm:py-28">
                        <div className="mx-auto max-w-2xl text-center">
                            <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
                                Ready to simplify your team management?
                            </h2>
                            <p className="mt-4 text-base text-white/60">
                                Join public sector teams already using OrgCentral.
                                Free to start, no commitment.
                            </p>
                            <Link
                                href="/sign-up"
                                className="mt-8 inline-block rounded-lg bg-white px-8 py-3 text-sm font-medium text-[#0066CC] transition hover:bg-white/90"
                            >
                                Start free →
                            </Link>
                        </div>
                    </div>
                </section>

                {/* ─── FOOTER ─── */}
                <footer className="border-t border-white/10 bg-[#001A4E]">
                    <div className="mx-auto max-w-6xl px-6 py-8">
                        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
                            <div className="text-xs text-white/30">
                                © 2026 OrgCentral
                            </div>
                            <div className="flex gap-6 text-xs text-white/30">
                                <span className="cursor-default">Privacy Policy</span>
                                <span className="cursor-default">Terms</span>
                                <span className="cursor-default">Contact</span>
                                <Link href="/sign-in" className="transition hover:text-white/60">
                                    Sign in
                                </Link>
                                <Link href="/sign-up" className="transition hover:text-white/60">
                                    Sign up
                                </Link>
                            </div>
                        </div>
                    </div>
                </footer>
            </div>
        </>
    )
}

function StatCard({ label, value }: { label: string; value: string }) {
    return (
        <div className="rounded-lg bg-white/[0.06] p-3">
            <div className="text-lg font-semibold text-white">{value}</div>
            <div className="mt-0.5 text-[10px] text-white/40">{label}</div>
        </div>
    )
}

function MockRow({
    name,
    type,
    days,
    status,
}: {
    name: string
    type: string
    days: string
    status: string
}) {
    const isPending = status === 'Pending'
    return (
        <div className="flex items-center justify-between rounded-lg bg-white/[0.04] px-4 py-2.5">
            <div className="flex items-center gap-3">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#0066CC]/20 text-[10px] font-medium text-[#00A9CE]">
                    {name.split(' ').map((n) => n[0]).join('')}
                </div>
                <div>
                    <div className="text-xs font-medium text-white/80">{name}</div>
                    <div className="text-[10px] text-white/30">{type} · {days}</div>
                </div>
            </div>
            <span
                className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                    isPending
                        ? 'bg-amber-400/10 text-amber-400'
                        : 'bg-emerald-400/10 text-emerald-400'
                }`}
            >
                {status}
            </span>
        </div>
    )
}

function FeatureCard({
    emoji,
    title,
    description,
}: {
    emoji: string
    title: string
    description: string
}) {
    return (
        <div className="rounded-2xl border border-[#E8EDEE] bg-white p-6 transition hover:shadow-md">
            <div className="mb-3 text-2xl">{emoji}</div>
            <h3 className="text-base font-semibold text-[#231F20]">{title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-[#231F20]/60">
                {description}
            </p>
        </div>
    )
}
