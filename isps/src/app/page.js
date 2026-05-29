import Link from "next/link";
import { getUser } from "./lib/getUser";
import { redirect } from "next/navigation";

export const metadata = {
  title: "NetAdmin — ISP Management Dashboard",
  description: "Manage your ISP subscribers, collect fees, and track billing — all in one place.",
};

export default async function Home() {
  const currentUser = await getUser();
  if (currentUser?.id) redirect("/dashboard");

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── HERO ── */}
      <section className="max-w-2xl mx-auto px-4 pt-24 pb-16 text-center">

        <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 leading-tight tracking-tight mb-5">
          Manage your network.<br />
          Not spreadsheets.
        </h1>

        <p className="text-base text-gray-500 leading-relaxed max-w-md mx-auto mb-8">
          NetAdmin gives ISP operators a clean dashboard to register subscribers, collect monthly fees, and track billing — all in one place.
        </p>

        <div className="flex items-center justify-center gap-3 flex-wrap">
          <Link
            href="/signup"
            className="bg-gray-900 text-white text-sm font-semibold rounded-xl px-6 py-3 hover:bg-gray-700 active:bg-gray-800 transition-colors"
          >
            Get started free
          </Link>
          <Link
            href="/login"
            className="bg-white text-gray-700 text-sm font-semibold rounded-xl px-6 py-3 border border-gray-200 hover:bg-gray-50 active:bg-gray-100 transition-colors"
          >
            Sign in
          </Link>
        </div>
      </section>

      {/* ── DASHBOARD MOCKUP ── */}
      <section className="max-w-3xl mx-auto px-4 pb-20">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

          {/* fake topbar */}
          <div className="flex items-center justify-between px-4 h-11 border-b border-gray-100 bg-white">
            <span className="text-sm font-bold text-gray-900 tracking-tight">NetAdmin</span>
            <span className="text-xs font-medium text-gray-500 bg-gray-100 rounded-full px-3 py-1">@admin</span>
          </div>

          <div className="flex">
            {/* fake sidebar */}
            <div className="hidden sm:flex flex-col gap-0.5 w-44 shrink-0 border-r border-gray-100 p-3">
              {[
                { label: "Dashboard", active: true },
                { label: "Fees" },
                { label: "Add User" },
                { label: "Edit User" },
                { label: "Plans" },
                { label: "Settings" },
              ].map(({ label, active }) => (
                <div
                  key={label}
                  className={`text-xs font-medium px-3 py-2 rounded-xl ${active ? "bg-gray-900 text-white" : "text-gray-400"
                    }`}
                >
                  {label}
                </div>
              ))}
            </div>

            {/* fake main */}
            <div className="flex-1 p-4 bg-gray-50 flex flex-col gap-3">

              {/* stat cards */}
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: "Subscribers", value: "38" },
                  { label: "Revenue (May)", value: "Rs 76,400", accent: "text-green-600" },
                  { label: "Pending", value: "Rs 12,200", accent: "text-yellow-600" },
                ].map(({ label, value, accent }) => (
                  <div key={label} className="bg-white rounded-xl border border-gray-100 p-3">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">{label}</p>
                    <p className={`text-lg font-bold ${accent ?? "text-gray-900"}`}>{value}</p>
                  </div>
                ))}
              </div>

              {/* fake table */}
              <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                <div className="grid grid-cols-4 px-3 py-2 border-b border-gray-100 bg-gray-50">
                  {["Username", "Plan", "Due", "Status"].map(h => (
                    <span key={h} className="text-xs font-semibold text-gray-400 uppercase tracking-wide">{h}</span>
                  ))}
                </div>
                {[
                  { user: "ali_hassan", plan: "20 Mbps", due: "Rs 2,000", status: "paid", color: "text-green-700 bg-green-50 border-green-200" },
                  { user: "farhan_net", plan: "50 Mbps", due: "Rs 3,500", status: "partial", color: "text-yellow-700 bg-yellow-50 border-yellow-200" },
                  { user: "zara_isp", plan: "10 Mbps", due: "Rs 1,500", status: "unpaid", color: "text-red-600 bg-red-50 border-red-200" },
                  { user: "bilal_wlan", plan: "100 Mbps", due: "Rs 6,000", status: "paid", color: "text-green-700 bg-green-50 border-green-200" },
                ].map(row => (
                  <div key={row.user} className="grid grid-cols-4 px-3 py-2.5 border-b border-gray-50 text-xs text-gray-700 last:border-0 items-center">
                    <span className="font-medium">{row.user}</span>
                    <span className="text-gray-500">{row.plan}</span>
                    <span className="text-gray-500">{row.due}</span>
                    <span>
                      <span className={`inline-block text-xs font-semibold px-2 py-0.5 rounded-full border ${row.color}`}>
                        {row.status}
                      </span>
                    </span>
                  </div>
                ))}
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className="max-w-3xl mx-auto px-4 pb-20">
        <div className="mb-8">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">Features</p>
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Built for real ISP operators</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            {
              title: "Billing Dashboard",
              desc: "Monthly revenue, recovery rate, and pending balance. Filter by month and year, drill into paid, partial, and unpaid subscriber lists.",
              icon: (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                  <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" />
                  <rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" />
                </svg>
              ),
            },
            {
              title: "Fee Collection",
              desc: "Record full or partial payments per subscriber. Track remaining balances and maintain a complete monthly transaction history.",
              icon: (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                  <circle cx="12" cy="12" r="9" /><line x1="12" y1="6" x2="12" y2="3" /><line x1="12" y1="18" x2="12" y2="21" />
                  <path d="M14.5 9a2.5 2.5 0 0 0-5 0v1h5V9z" /><path d="M9.5 10v4a2.5 2.5 0 0 0 5 0v-4" />
                </svg>
              ),
            },
            {
              title: "Subscriber Management",
              desc: "Register clients with username, contact, and plan. Passwords are auto-generated or set manually. Edit or remove subscribers any time.",
              icon: (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
                  <line x1="19" y1="8" x2="19" y2="14" /><line x1="16" y1="11" x2="22" y2="11" />
                </svg>
              ),
            },
            {
              title: "Flexible Plans",
              desc: "Create speed-tier plans with custom monthly rates in Rs. Each admin manages their own independent plan catalog.",
              icon: (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                  <path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
                </svg>
              ),
            },
            {
              title: "Quick User Editing",
              desc: "Live username autocomplete search. Update credentials, contact, or plan in one form — changes reflect instantly in billing.",
              icon: (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
              ),
            },
            {
              title: "Secure Auth",
              desc: "Session-based login, IP rate limiting, and scrypt password hashing. Each admin account is completely isolated from others.",
              icon: (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                  <rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              ),
            },
          ].map(({ title, desc, icon }) => (
            <div key={title} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-600 mb-3">
                {icon}
              </div>
              <p className="text-sm font-semibold text-gray-900 mb-1">{title}</p>
              <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="max-w-3xl mx-auto px-4 pb-20">
        <div className="mb-8">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">How it works</p>
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Up and running in minutes</h2>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm divide-y divide-gray-100">
          {[
            { num: "01", title: "Create your account", desc: "Sign up with a username and password. Your account is isolated — only you see your subscribers and data." },
            { num: "02", title: "Define your plans", desc: "Add speed tiers with a monthly rate in Rs. Create as many plan types as your network offers." },
            { num: "03", title: "Register subscribers", desc: "Add clients with a username, optional contact, and plan assignment. Passwords are auto-generated." },
            { num: "04", title: "Collect fees monthly", desc: "Record payments each month. Your dashboard updates with live revenue, recovery rate, and outstanding balances." },
          ].map(({ num, title, desc }) => (
            <div key={num} className="flex items-start gap-4 px-5 py-4">
              <span className="text-xs font-bold text-gray-300 mt-0.5 shrink-0 w-6">{num}</span>
              <div>
                <p className="text-sm font-semibold text-gray-900 mb-0.5">{title}</p>
                <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="max-w-3xl mx-auto px-4 pb-20">
        <div className="bg-gray-900 rounded-2xl p-10 text-center">
          <h2 className="text-2xl font-bold text-white mb-3 tracking-tight">Ready to take control?</h2>
          <p className="text-sm text-gray-400 mb-7 max-w-sm mx-auto leading-relaxed">
            Create a free account and bring your subscriber data online today.
          </p>
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <Link
              href="/signup"
              className="bg-white text-gray-900 text-sm font-semibold rounded-xl px-6 py-3 hover:bg-gray-100 active:bg-gray-200 transition-colors"
            >
              Create free account
            </Link>
            <Link
              href="/login"
              className="text-gray-400 text-sm font-semibold rounded-xl px-6 py-3 border border-gray-700 hover:bg-gray-800 hover:text-white transition-colors"
            >
              Sign in
            </Link>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-gray-100 bg-white px-6 py-5 flex items-center justify-between flex-wrap gap-3">
        <span className="text-sm font-bold text-gray-400 tracking-tight">NetAdmin</span>
        <div className="flex gap-5">
          {[
            { label: "Login", href: "/login" },
            { label: "Sign up", href: "/signup" },
            { label: "Dashboard", href: "/dashboard" },
          ].map(({ label, href }) => (
            <Link key={href} href={href} className="text-sm text-gray-400 hover:text-gray-700 transition-colors">
              {label}
            </Link>
          ))}
        </div>
      </footer>

    </div>
  );
}