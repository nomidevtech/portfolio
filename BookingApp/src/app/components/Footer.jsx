import Link from "next/link";

export default function Footer() {
    return (
        <footer className="mt-auto border-t border-emerald-100 bg-white">
            <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 py-6 text-sm text-slate-500 sm:flex-row sm:px-6 lg:px-8">
                <div className="flex items-center gap-2 font-semibold text-slate-700">
                    <span className="grid h-7 w-7 place-items-center rounded-lg bg-teal-700 text-xs text-white font-bold">CF</span>
                    <span>ClinicFlow</span>
                </div>
                <nav className="flex gap-5">
                    <Link href="/" className="hover:text-teal-700 transition">Home</Link>
                    <Link href="/bookings" className="hover:text-teal-700 transition">Book Appointment</Link>
                    <Link href="/login" className="hover:text-teal-700 transition">Clinic Login</Link>
                </nav>
                <p className="text-xs text-slate-400">© {new Date().getFullYear()} ClinicFlow</p>
            </div>
        </footer>
    );
}
