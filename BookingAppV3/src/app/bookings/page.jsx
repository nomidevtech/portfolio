import Link from "next/link";
import { db } from "../lib/turso";
import { redisIpLimit } from "../lib/redis";

export const metadata = {
    title: "Book Appointment",
    description: "Browse verified clinics and start an appointment booking.",
};

export default async function AllClinics() {
    const redisLimit = await redisIpLimit(15, "bookings", 60 * 15);
    if (!redisLimit.ok) return <main className="page-shell"><p className="status-error">{redisLimit.message}</p></main>

    const fetchAllClinics = await db.execute(`SELECT public_id, clinic_name, clinic_phone, clinic_address FROM admins WHERE status = 'verified'`);
    if (fetchAllClinics.rows.length === 0) return <main className="page-shell"><p className="status-warning">No clinics found.</p></main>

    return (
        <main className="page-shell">
            <div className="mb-8">
                <p className="soft-pill">Patient booking</p>
                <h1 className="mt-4 text-3xl font-black text-slate-950">Choose a clinic</h1>
                <p className="mt-2 text-slate-600">Select a verified clinic to view available doctors and appointments.</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                {fetchAllClinics.rows.map(fn => (
                    <section key={fn.public_id} className="data-card">
                        <h2 className="text-xl font-black text-slate-950">
                            {fn.clinic_name.split("-").map(word => word[0].toUpperCase() + word.slice(1)).join(" ")}
                        </h2>
                        <dl className="mt-4 grid gap-2 text-sm text-slate-600">
                            <div><dt className="inline font-bold text-slate-700">Phone: </dt><dd className="inline">{fn.clinic_phone}</dd></div>
                            <div><dt className="inline font-bold text-slate-700">Address: </dt><dd className="inline">{fn.clinic_address?.split("-").map(word => word[0]?.toUpperCase() + word.slice(1)).join(" ")}</dd></div>
                        </dl>
                        <Link href={`/bookings/${fn.public_id}`} className="btn-primary mt-5">View appointments</Link>
                    </section>
                ))}
            </div>
        </main>
    );
}
