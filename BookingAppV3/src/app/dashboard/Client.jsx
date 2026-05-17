"use client";

export default function ClientDashboard({ role, stats }) {
    if (!stats) return <main className="page-shell"><p className="section-panel">Loading stats...</p></main>;

    const { bookingsCount, activeUpcomingSlots, totalBookings, totalDoctors } = stats;

    return (
        <main className="page-shell">
            <div className="mb-8">
                <p className="soft-pill">{role === "admin" ? "Clinic overview" : "Doctor overview"}</p>
                <h1 className="mt-4 text-3xl font-black text-slate-950">
                    {role === "admin" ? "Clinic dashboard" : "My dashboard"}
                </h1>
                <p className="mt-2 text-slate-600">Monitor bookings, active slots, and current appointment status.</p>
            </div>

            <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-3">
                {role === "admin" && <MetricCard label="Total doctors" value={totalDoctors} />}
                <MetricCard label="Lifetime bookings" value={totalBookings} />
                <MetricCard label="Active upcoming slots" value={activeUpcomingSlots} emphasis />
            </div>

            <section className="section-panel">
                <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
                    <div>
                        <h2 className="text-xl font-black text-slate-950">Bookings breakdown</h2>
                        <p className="mt-1 text-sm text-slate-600">Current status distribution across booking records.</p>
                    </div>
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
                    <StatCard title="Verified" count={bookingsCount.verified} color="text-emerald-700" bg="bg-emerald-50" border="border-emerald-200" />
                    <StatCard title="Pending" count={bookingsCount.pending} color="text-amber-700" bg="bg-amber-50" border="border-amber-200" />
                    <StatCard title="Unverified" count={bookingsCount.unverified} color="text-orange-700" bg="bg-orange-50" border="border-orange-200" />
                    <StatCard title="Cancelled" count={bookingsCount.cancelled} color="text-rose-700" bg="bg-rose-50" border="border-rose-200" />
                    <StatCard title="Revoked" count={bookingsCount.revoked} color="text-slate-700" bg="bg-slate-100" border="border-slate-200" />
                </div>
            </section>
        </main>
    );
}

function MetricCard({ label, value, emphasis = false }) {
    return (
        <div className={emphasis ? "rounded-2xl border border-teal-200 bg-teal-700 p-6 text-white shadow-sm" : "data-card"}>
            <p className={emphasis ? "text-sm font-semibold text-emerald-100" : "text-sm font-semibold text-slate-500"}>{label}</p>
            <p className="mt-2 text-4xl font-black">{value || 0}</p>
        </div>
    );
}

function StatCard({ title, count, color, bg, border }) {
    return (
        <div className={`rounded-2xl border p-5 ${border} ${bg}`}>
            <p className="text-sm font-bold uppercase text-slate-600">{title}</p>
            <p className={`mt-2 text-3xl font-black ${color}`}>{count || 0}</p>
        </div>
    );
}
