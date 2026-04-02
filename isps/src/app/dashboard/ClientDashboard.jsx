'use client';

import { useActionState, useMemo } from "react";
import { fetchStatsServerAction } from "./fetchSA";
import Form from "next/form";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";

export default function ClientDashboard({ initialData, yearsArr = [], monthsArr = [] }) {
  const [state, action, isPending] = useActionState(fetchStatsServerAction, initialData);
  const { stats, message, ok } = state;

  // Prepare data for the Donut Chart
  const chartData = useMemo(() => {
    if (!stats) return [];
    return [
      { name: "Paid", value: stats.paid, color: "#10b981" },    // Emerald-500
      { name: "Partial", value: stats.partial, color: "#f59e0b" }, // Amber-500
      { name: "Unpaid", value: stats.unpaid, color: "#ef4444" },  // Red-500
    ];
  }, [stats]);

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 text-slate-900">
      <div className="max-w-5xl mx-auto space-y-6">

        {/* Header & Controls */}
        <header className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <h1 className="text-xl font-semibold mb-6">Revenue Dashboard</h1>

          <Form action={action} className="flex flex-col sm:flex-row items-end gap-4">
            <div className="w-full sm:w-auto flex-1 space-y-2">
              <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Month</label>
              <select
                name="month"
                defaultValue=""
                required
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              >
                <option value="" disabled>Select month</option>
                {monthsArr.map((month) => (
                  <option key={month} value={month}>{month}</option>
                ))}
              </select>
            </div>

            <div className="w-full sm:w-auto flex-1 space-y-2">
              <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Year</label>
              <select
                name="year"
                defaultValue={2026}
                required
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              >
                <option value="" disabled>Select year</option>
                {yearsArr.map((year) => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="w-full sm:w-auto bg-slate-900 hover:bg-slate-800 text-white font-medium px-8 py-2.5 rounded-lg disabled:opacity-50 transition-colors shadow-lg shadow-slate-200"
            >
              {isPending ? "Updating..." : "Generate Report"}
            </button>
          </Form>

          {message && (
            <p className={`mt-4 text-sm font-medium ${!ok ? "text-red-600" : "text-emerald-600"}`}>
              {message}
            </p>
          )}
        </header>

        {/* Dashboard Content */}
        {stats && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* Stat Cards */}
            <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <StatCard label="Total Users" value={stats.numberOfUsers} sub="Active Connections" />
              <StatCard label="Total Revenue" value={`Rs. ${stats.totalRevenue}`} sub="Gross Billing" />
              <StatCard label="Recovery" value={`Rs. ${stats.recovery}`} sub="Collected" isHighlight />
              <StatCard label="Pending" value={`Rs. ${stats.pending}`} sub="Outstanding" />
            </div>

            {/* Donut Chart Card */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col items-center justify-center min-h-[350px]">
              <h3 className="text-sm font-semibold text-slate-500 uppercase mb-4">Payment Status</h3>
              <div className="w-full h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    />
                    <Legend verticalAlign="bottom" height={36} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value, sub, isHighlight = false }) {
  return (
    <div className={`p-6 rounded-2xl border transition-all ${isHighlight
        ? "bg-blue-50 border-blue-100 ring-1 ring-blue-200"
        : "bg-white border-slate-200"
      }`}>
      <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">{label}</p>
      <p className="text-2xl font-bold text-slate-900">{value}</p>
      <p className="text-xs text-slate-400 mt-1">{sub}</p>
    </div>
  );
}n