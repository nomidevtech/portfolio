"use client";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

const PKR = (val) =>
  new Intl.NumberFormat("en-PK", {
    style: "currency",
    currency: "PKR",
    maximumFractionDigits: 0,
  }).format(val ?? 0);

const STATUS_COLORS = {
  paid: "#22c55e",
  partial: "#f59e0b",
  unpaid: "#ef4444",
};

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const { name, value } = payload[0];
  return (
    <div className="bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm shadow-xl">
      <span className="text-zinc-400 capitalize">{name}: </span>
      <span className="text-white font-semibold">{value}</span>
    </div>
  );
};

const BarTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm shadow-xl">
      <p className="text-zinc-400 mb-1">{label}</p>
      {payload.map((p) => (
        <p key={p.name} style={{ color: p.fill }} className="font-semibold">
          {p.name}: {PKR(p.value)}
        </p>
      ))}
    </div>
  );
};

const StatCard = ({ label, value, sub, accent }) => (
  <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 flex flex-col gap-1 hover:border-zinc-600 transition-colors duration-200">
    <p className="text-xs font-medium text-zinc-500 uppercase tracking-widest">{label}</p>
    <p className={`text-2xl font-bold ${accent ?? "text-white"}`}>{value}</p>
    {sub && <p className="text-xs text-zinc-600">{sub}</p>}
  </div>
);

const RecoveryBar = ({ label, value, max, color }) => {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0;
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex justify-between text-xs">
        <span className="text-zinc-400">{label}</span>
        <span className="text-zinc-300 font-medium">{PKR(value)}</span>
      </div>
      <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
      <p className="text-xs text-zinc-600">{pct.toFixed(1)}% of total revenue</p>
    </div>
  );
};

export default function ClientDashboard({ payload }) {
  const { numberOfUsers, totalRevenue, recovery, pending, unpaid, partial, paid } = payload;

  const donutData = [
    { name: "paid", value: paid },
    { name: "partial", value: partial },
    { name: "unpaid", value: unpaid },
  ].filter((d) => d.value > 0);

  const barData = [
    { name: "Revenue", Revenue: totalRevenue },
    { name: "Collected", Collected: recovery },
    { name: "Pending", Pending: pending },
  ];

  const recoveryRate = totalRevenue > 0 ? ((recovery / totalRevenue) * 100).toFixed(1) : 0;

  const d = new Date();
  const monthName = d.toLocaleString("default", { month: "long" });
  const year = d.getFullYear();

  return (
    <div className="min-h-screen bg-zinc-950 text-white font-sans p-6 md:p-10">

      {/* Header */}
      <div className="mb-10">
        <p className="text-xs text-zinc-500 uppercase tracking-widest mb-1">Admin Dashboard</p>
        <h1 className="text-3xl font-bold text-white">
          {monthName} <span className="text-zinc-500">{year}</span>
        </h1>
        <p className="text-sm text-zinc-600 mt-1">Billing overview for current period</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total Users" value={numberOfUsers} sub="Enrolled this month" />
        <StatCard label="Total Revenue" value={PKR(totalRevenue)} sub="Expected collections" accent="text-blue-400" />
        <StatCard label="Collected" value={PKR(recovery)} sub={`${recoveryRate}% recovery rate`} accent="text-green-400" />
        <StatCard label="Pending" value={PKR(pending)} sub="Outstanding balance" accent="text-amber-400" />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">

        {/* Donut Chart — Fee Status */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
          <p className="text-xs font-medium text-zinc-500 uppercase tracking-widest mb-1">Fee Status</p>
          <p className="text-lg font-semibold text-white mb-6">Student Breakdown</p>
          <div className="flex items-center gap-6">
            <div className="w-40 h-40 shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={donutData}
                    cx="50%"
                    cy="50%"
                    innerRadius={42}
                    outerRadius={64}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {donutData.map((entry) => (
                      <Cell
                        key={entry.name}
                        fill={STATUS_COLORS[entry.name]}
                        stroke="transparent"
                      />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-col gap-3 flex-1">
              {[
                { key: "paid", label: "Paid", value: paid },
                { key: "partial", label: "Partial", value: partial },
                { key: "unpaid", label: "Unpaid", value: unpaid },
              ].map(({ key, label, value }) => (
                <div key={key} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: STATUS_COLORS[key] }}
                    />
                    <span className="text-sm text-zinc-400 capitalize">{label}</span>
                  </div>
                  <span className="text-sm font-semibold text-white">{value}</span>
                </div>
              ))}
              <div className="border-t border-zinc-800 pt-3 flex items-center justify-between">
                <span className="text-xs text-zinc-600">Total</span>
                <span className="text-sm font-bold text-white">{numberOfUsers}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bar Chart — Revenue Breakdown */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
          <p className="text-xs font-medium text-zinc-500 uppercase tracking-widest mb-1">Financials</p>
          <p className="text-lg font-semibold text-white mb-6">Revenue Breakdown</p>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={barData} barSize={32}>
              <CartesianGrid vertical={false} stroke="#27272a" />
              <XAxis
                dataKey="name"
                tick={{ fill: "#71717a", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: "#71717a", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `₨${(v / 1000).toFixed(0)}k`}
              />
              <Tooltip content={<BarTooltip />} cursor={{ fill: "#27272a" }} />
              <Bar dataKey="Revenue" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Collected" fill="#22c55e" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Pending" fill="#f59e0b" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recovery Progress */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
        <p className="text-xs font-medium text-zinc-500 uppercase tracking-widest mb-1">Collection Progress</p>
        <p className="text-lg font-semibold text-white mb-6">vs. Total Revenue</p>
        <div className="flex flex-col gap-5">
          <RecoveryBar
            label="Collected"
            value={recovery}
            max={totalRevenue}
            color="#22c55e"
          />
          <RecoveryBar
            label="Pending"
            value={pending}
            max={totalRevenue}
            color="#f59e0b"
          />
        </div>
      </div>

    </div>
  );
}