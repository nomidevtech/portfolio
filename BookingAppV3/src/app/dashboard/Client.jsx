"use client";

export default function ClientDashboard({ role, stats }) {
    if (!stats) return <p className="p-6">Loading stats...</p>;

    const { bookingsCount, activeUpcomingSlots, totalBookings, totalDoctors } = stats;

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">
                {role === "admin" ? "Clinic Dashboard" : "My Dashboard"}
            </h1>

            {/* Top Level Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {role === "admin" && (
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                        <p className="text-sm font-medium text-gray-500 mb-1">Total Doctors</p>
                        <p className="text-3xl font-bold text-gray-900">{totalDoctors}</p>
                    </div>
                )}

                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <p className="text-sm font-medium text-gray-500 mb-1">Total Lifetime Bookings</p>
                    <p className="text-3xl font-bold text-gray-900">{totalBookings}</p>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <p className="text-sm font-medium text-gray-500 mb-1">Active Upcoming Slots</p>
                    <p className="text-3xl font-bold text-blue-600">{activeUpcomingSlots}</p>
                </div>
            </div>

            {/* Booking Breakdown Stats */}
            <h2 className="text-xl font-bold text-gray-900 mb-4">Bookings Breakdown</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                <StatCard title="Verified" count={bookingsCount.verified} color="text-green-700" bg="bg-green-50" border="border-green-200" />
                <StatCard title="Pending" count={bookingsCount.pending} color="text-yellow-700" bg="bg-yellow-50" border="border-yellow-200" />
                <StatCard title="Unverified" count={bookingsCount.unverified} color="text-orange-700" bg="bg-orange-50" border="border-orange-200" />
                <StatCard title="Cancelled" count={bookingsCount.cancelled} color="text-red-700" bg="bg-red-50" border="border-red-200" />
                <StatCard title="Revoked" count={bookingsCount.revoked} color="text-gray-700" bg="bg-gray-100" border="border-gray-300" />
            </div>
        </div>
    );
}

// Reusable mini-component for the stat cards
function StatCard({ title, count, color, bg, border }) {
    return (
        <div className={`p-5 rounded-2xl border ${border} ${bg}`}>
            <p className="text-sm font-semibold text-gray-600 mb-1 uppercase tracking-wide">{title}</p>
            <p className={`text-3xl font-black ${color}`}>{count || 0}</p>
        </div>
    );
}