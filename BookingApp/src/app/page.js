import Link from "next/link";

export const metadata = {
  title: "Online Clinic Booking",
  description:
    "Book verified clinic appointments online or manage doctors, treatments, slots, and patient bookings from one clinic workspace.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "ClinicFlow | Online Clinic Booking",
    description: "A focused appointment booking and clinic operations platform.",
    url: "/",
  },
};

const patientSteps = [
  "Choose a verified clinic",
  "Select doctor and treatment",
  "Reserve an available slot",
  "Verify by email",
];

const clinicFeatures = [
  "Doctor profiles and departments",
  "Treatment durations and linked doctors",
  "Weekly templates and generated slots",
  "Booking revocation and patient notices",
  "Admin and doctor workspaces",
  "Recovery and email verification flows",
];

export default function Home() {
  return (
    <main>
      <section className="border-b border-emerald-100 bg-[radial-gradient(circle_at_top_left,#dff3ec_0,#f6faf8_34rem,#ffffff_100%)]">
        <div className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-6xl items-center gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-8">
          <div>
            <p className="soft-pill">Clinic booking and operations</p>
            <h1 className="mt-6 max-w-4xl text-4xl font-black leading-tight text-slate-950 sm:text-5xl lg:text-6xl">
              Appointment booking that fits real clinic workflows.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
              Patients can reserve care without phone calls. Clinics can manage doctors, treatments,
              schedules, verification, cancellations, and day-to-day booking control from one workspace.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/bookings" className="btn-primary px-6 py-3">
                Book an appointment
              </Link>
              <Link href="/signup" className="btn-secondary px-6 py-3">
                Create clinic account
              </Link>
            </div>
          </div>

          <div className="rounded-3xl border border-emerald-100 bg-white p-5 shadow-xl shadow-emerald-950/5">
            <div className="rounded-2xl bg-slate-950 p-5 text-white">
              <div className="flex items-center justify-between gap-4 border-b border-white/10 pb-4">
                <div>
                  <p className="text-sm font-semibold text-emerald-200">Today</p>
                  <h2 className="mt-1 text-2xl font-bold">Clinic schedule</h2>
                </div>
                <span className="rounded-full bg-emerald-400/15 px-3 py-1 text-xs font-bold text-emerald-100">
                  Live slots
                </span>
              </div>

              <div className="mt-5 grid gap-3">
                {[
                  ["09:00 AM", "Dermatology consult", "Verified"],
                  ["11:30 AM", "Dental checkup", "Pending email"],
                  ["02:15 PM", "Cardiology review", "Open"],
                ].map(([time, title, status]) => (
                  <div key={time} className="grid grid-cols-[5.5rem_1fr] gap-3 rounded-2xl bg-white/8 p-4">
                    <p className="text-sm font-bold text-emerald-100">{time}</p>
                    <div>
                      <p className="font-semibold">{title}</p>
                      <p className="mt-1 text-sm text-slate-300">{status}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              {[
                ["24/7", "Online booking"],
                ["Email", "Verification"],
                ["Role", "Admin and doctor"],
              ].map(([value, label]) => (
                <div key={label} className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4">
                  <p className="text-2xl font-black text-teal-800">{value}</p>
                  <p className="mt-1 text-sm font-semibold text-slate-600">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="page-shell">
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="section-panel">
            <p className="soft-pill">For patients</p>
            <h2 className="mt-4 text-3xl font-black text-slate-950">Find care and reserve a slot.</h2>
            <div className="mt-6 grid gap-3">
              {patientSteps.map((step, index) => (
                <div key={step} className="flex items-center gap-3 rounded-2xl border border-emerald-100 bg-emerald-50/70 p-4">
                  <span className="grid h-8 w-8 place-items-center rounded-full bg-teal-700 text-sm font-bold text-white">
                    {index + 1}
                  </span>
                  <p className="font-semibold text-slate-800">{step}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="section-panel">
            <p className="soft-pill">For clinics</p>
            <h2 className="mt-4 text-3xl font-black text-slate-950">Keep operations clear and controlled.</h2>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {clinicFeatures.map((feature) => (
                <div key={feature} className="rounded-2xl border border-emerald-100 bg-white p-4 text-sm font-semibold text-slate-700">
                  {feature}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-emerald-100 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-16 text-center sm:px-6 lg:px-8">
          <p className="soft-pill mx-auto">Ready to start?</p>
          <h2 className="mt-4 text-3xl font-black text-slate-950 sm:text-4xl">
            Book your first appointment today.
          </h2>
          <p className="mt-4 text-slate-600 max-w-xl mx-auto">
            No account needed for patients. Find a verified clinic, pick a slot, and confirm by email.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link href="/bookings" className="btn-primary px-6 py-3">
              Browse clinics
            </Link>
            <Link href="/signup" className="btn-secondary px-6 py-3">
              Register your clinic
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
