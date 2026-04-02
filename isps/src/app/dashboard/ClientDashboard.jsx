'use client'

import { useActionState } from "react";
import { fetchStatsServerAction } from "./fetchSA";
import Form from "next/form";

function StatCard({ label, value, accent }) {
    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">{label}</p>
            <p className={`text-2xl font-bold ${accent || "text-gray-900"}`}>{value ?? "—"}</p>
        </div>
    );
}

function StatusBadge({ label, count, color }) {
    const colors = {
        green: "bg-green-50 text-green-700 border-green-200",
        yellow: "bg-yellow-50 text-yellow-700 border-yellow-200",
        red: "bg-red-50 text-red-700 border-red-200",
    };
    return (
        <div className={`flex items-center justify-between px-4 py-3 rounded-xl border ${colors[color]}`}>
            <span className="text-sm font-medium capitalize">{label}</span>
            <span className="text-sm font-bold">{count ?? 0}</span>
        </div>
    );
}

export default function ClientDashboard({ initialData, yearsArr = [], monthsArr = [] }) {
    const [state, action, isPending] = useActionState(fetchStatsServerAction, initialData);
    const { stats, message } = state;

    return (
        <div className="max-w-lg mx-auto px-4 py-6">
            <div className="mb-6">
                <h1 className="text-xl font-bold text-gray-900">Dashboard</h1>
                <p className="text-sm text-gray-500 mt-0.5">Monthly billing overview</p>
            </div>

            {/* Filter form */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-6">
                <Form action={action} className="flex gap-2.5">
                    <select
                        name="month"
                        defaultValue=""
                        required
                        className="flex-1 border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
                    >
                        <option value="" disabled>Month</option>
                        {monthsArr.map((month) => (
                            <option key={month} value={month}>{month}</option>
                        ))}
                    </select>

                    <select
                        name="year"
                        defaultValue={2026}
                        required
                        className="w-24 border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
                    >
                        <option value="" disabled>Year</option>
                        {yearsArr.map((year) => (
                            <option key={year} value={year}>{year}</option>
                        ))}
                    </select>

                    <button
                        type="submit"
                        disabled={isPending}
                        className="bg-gray-900 text-white rounded-xl px-4 py-2.5 text-sm font-semibold hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors whitespace-nowrap"
                    >
                        {isPending ? "…" : "Fetch"}
                    </button>
                </Form>
            </div>

            {message && (
                <p className={`text-sm px-4 py-3 rounded-xl border mb-6 ${
                    state.ok
                        ? "text-green-700 bg-green-50 border-green-200"
                        : "text-red-600 bg-red-50 border-red-200"
                }`}>
                    {message}
                </p>
            )}

            {stats && (
                <>
                    <div className="grid grid-cols-2 gap-3 mb-4">
                        <StatCard label="Total Users" value={stats.numberOfUsers} />
                        <StatCard label="Total Revenue" value={`Rs ${stats.totalRevenue}`} />
                        <StatCard label="Collected" value={`Rs ${stats.recovery}`} accent="text-green-600" />
                        <StatCard label="Pending" value={`Rs ${stats.pending}`} accent="text-red-500" />
                    </div>

                    <div className="flex flex-col gap-2.5">
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide px-1">Payment Status</p>
                        <StatusBadge label="Paid" count={stats.paid} color="green" />
                        <StatusBadge label="Partial" count={stats.partial} color="yellow" />
                        <StatusBadge label="Unpaid" count={stats.unpaid} color="red" />
                    </div>
                </>
            )}
        </div>
    );
}
