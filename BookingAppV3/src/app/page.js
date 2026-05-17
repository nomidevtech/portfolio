import Link from "next/link";

export const metadata = {
  title: "ClinicFlow — Smart Clinic Booking & Management",
  description:
    "Appointment scheduling platform for patients, clinics, and doctors.",
};

export default function Home() {
  return (
    <main className="min-h-screen bg-white text-gray-900">
      <section className="relative overflow-hidden border-b border-gray-100">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-50 via-white to-gray-100" />

        <div className="relative max-w-7xl mx-auto px-6 py-24 lg:py-32">
          <div className="max-w-4xl">
            <div className="inline-flex items-center rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-medium shadow-sm">
              Modern Clinic & Appointment Platform
            </div>

            <h1 className="mt-8 text-5xl lg:text-7xl font-black tracking-tight leading-tight">
              Healthcare booking
              <span className="block text-gray-500">
                built for both patients & clinics
              </span>
            </h1>

            <p className="mt-8 text-lg text-gray-600 leading-8 max-w-3xl">
              Patients can instantly book appointments online. Clinics can
              manage doctors, schedules, treatments, cancellations, and patient
              flows from one centralized system.
            </p>
          </div>

          <div className="mt-20 grid lg:grid-cols-2 gap-8">
            <div className="rounded-[32px] border border-gray-200 bg-white shadow-xl p-8 hover:-translate-y-1 transition">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gray-500">
                    For Patients
                  </p>

                  <h2 className="mt-3 text-4xl font-black">
                    Book appointments online
                  </h2>
                </div>

                <div className="h-16 w-16 rounded-3xl bg-gray-900 text-white flex items-center justify-center text-2xl">
                  🩺
                </div>
              </div>

              <p className="mt-6 text-gray-600 leading-7 text-lg">
                Browse clinics, select available slots, verify your booking, and
                manage appointments without phone calls or waiting lines.
              </p>

              <div className="mt-8 space-y-4">
                {[
                  "Find available clinics instantly",
                  "Book verified appointment slots",
                  "Receive email confirmations",
                  "Simple and fast scheduling flow",
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-3 rounded-2xl bg-gray-50 px-4 py-4"
                  >
                    <div className="h-2.5 w-2.5 rounded-full bg-gray-900" />
                    <p className="font-medium">{item}</p>
                  </div>
                ))}
              </div>

              <Link
                href="/bookings"
                className="mt-10 inline-flex items-center justify-center rounded-2xl bg-gray-900 px-7 py-4 text-sm font-semibold text-white hover:bg-gray-700 transition"
              >
                Book Appointment
              </Link>
            </div>

            <div className="rounded-[32px] border border-gray-900 bg-gray-900 text-white shadow-2xl p-8 hover:-translate-y-1 transition">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gray-400">
                    For Clinics
                  </p>

                  <h2 className="mt-3 text-4xl font-black">
                    Run your clinic efficiently
                  </h2>
                </div>

                <div className="h-16 w-16 rounded-3xl bg-white text-gray-900 flex items-center justify-center text-2xl">
                  🏥
                </div>
              </div>

              <p className="mt-6 text-gray-300 leading-7 text-lg">
                Manage doctors, appointments, patient schedules, treatments,
                cancellations, and clinic workflows with a secure admin system.
              </p>

              <div className="mt-8 space-y-4">
                {[
                  "Doctor & department management",
                  "Treatment scheduling system",
                  "Appointment control dashboard",
                  "Automated booking workflows",
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-3 rounded-2xl border border-gray-700 bg-gray-800/50 px-4 py-4"
                  >
                    <div className="h-2.5 w-2.5 rounded-full bg-white" />
                    <p className="font-medium">{item}</p>
                  </div>
                ))}
              </div>

              <div className="mt-10 flex flex-wrap gap-4">
                <Link
                  href="/signup"
                  className="inline-flex items-center justify-center rounded-2xl bg-white px-7 py-4 text-sm font-semibold text-gray-900 hover:bg-gray-200 transition"
                >
                  Create Clinic Account
                </Link>

                <Link
                  href="/pricing"
                  className="inline-flex items-center justify-center rounded-2xl border border-gray-600 px-7 py-4 text-sm font-semibold text-white hover:bg-gray-800 transition"
                >
                  View Pricing
                </Link>
              </div>
            </div>
          </div>

          <div className="mt-24 grid md:grid-cols-3 gap-6">
            <div className="rounded-3xl border border-gray-200 p-8">
              <h3 className="text-4xl font-black">24/7</h3>
              <p className="mt-3 text-gray-600">
                Patients can book appointments anytime.
              </p>
            </div>

            <div className="rounded-3xl border border-gray-200 p-8">
              <h3 className="text-4xl font-black">Secure</h3>
              <p className="mt-3 text-gray-600">
                Verification flows and protected sessions included.
              </p>
            </div>

            <div className="rounded-3xl border border-gray-200 p-8">
              <h3 className="text-4xl font-black">Simple</h3>
              <p className="mt-3 text-gray-600">
                Minimal operational workflow for clinics and staff.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 py-24">
        <div className="text-center max-w-3xl mx-auto">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gray-500">
            Platform Features
          </p>

          <h2 className="mt-4 text-4xl lg:text-5xl font-black tracking-tight">
            Everything needed for clinic operations
          </h2>
        </div>

        <div className="mt-20 grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            {
              title: "Appointment Booking",
              desc: "Patients can reserve slots online with verification-based confirmation.",
            },
            {
              title: "Doctor Management",
              desc: "Add doctors, departments, schedules, and linked treatments.",
            },
            {
              title: "Treatment Management",
              desc: "Configure treatments with durations and scheduling support.",
            },
            {
              title: "Cancellation Handling",
              desc: "Single or bulk booking revocation with notification support.",
            },
            {
              title: "Authentication System",
              desc: "Role-based login, sessions, recovery, and verification flows.",
            },
            {
              title: "Automated Cleanup",
              desc: "Background cleanup for ghost and expired bookings.",
            },
          ].map((feature, idx) => (
            <div
              key={idx}
              className="rounded-3xl border border-gray-200 bg-white p-8 hover:shadow-xl transition"
            >
              <div className="h-14 w-14 rounded-2xl bg-gray-900 text-white flex items-center justify-center text-lg font-bold">
                {idx + 1}
              </div>

              <h3 className="mt-6 text-2xl font-bold">
                {feature.title}
              </h3>

              <p className="mt-4 text-gray-600 leading-7">
                {feature.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-gray-900 text-white">
        <div className="max-w-5xl mx-auto px-6 py-24 text-center">
          <h2 className="text-4xl lg:text-6xl font-black tracking-tight">
            Start managing appointments smarter
          </h2>

          <p className="mt-6 text-lg text-gray-300 leading-8">
            Whether you are booking as a patient or operating a clinic, the
            platform adapts to your workflow.
          </p>

          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Link
              href="/bookings"
              className="rounded-2xl bg-white px-8 py-4 font-semibold text-gray-900 hover:bg-gray-200 transition"
            >
              I’m a Patient
            </Link>

            <Link
              href="/pricing"
              className="rounded-2xl border border-gray-700 px-8 py-4 font-semibold text-white hover:bg-gray-800 transition"
            >
              I’m a Clinic Admin
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}