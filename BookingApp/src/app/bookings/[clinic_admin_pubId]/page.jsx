import { redisIpLimit } from "@/app/lib/redis";
import { db } from "@/app/lib/turso";
import { fromHyphenSlug, fromUnderscoreSlug } from "@/app/utils/displaySlug";
import Link from "next/link";
import StatusPage from "@/app/components/StatusPage";

export const metadata = {
    title: "Clinic Doctors",
    description: "Choose a doctor and treatment for appointment booking.",
};

export default async function ClinicAdminAllBookings({ params }) {
    const redisLimit = await redisIpLimit(15, "bookingsPerClinic", 60 * 15);
    if (!redisLimit.ok) return <main className="page-shell"><p className="status-error">{redisLimit.message}</p></main>

    const { clinic_admin_pubId } = await params;

    const fetchAminData = await db.execute(`SELECT * FROM admins WHERE public_id = ?`, [clinic_admin_pubId]);
    if (fetchAminData.rows.length === 0) return <main className="page-shell"><p className="status-error">Link is broken.</p></main>;

    const adminId = fetchAminData.rows[0].id;
    const clinicName = fromHyphenSlug(fetchAminData.rows[0].clinic_name);
    const fetch = await db.execute(`SELECT doctor_id FROM slots WHERE admin_id = ? AND full_date_at_period >= DATE('now') AND status = 'active' ORDER BY full_date_at_period`, [adminId]);

    if (fetch.rows.length === 0) return <StatusPage type="warning" message="No appointment slots are available at this clinic right now." backHref="/bookings" backLabel="Browse clinics" />;

    const doctorIds = [...new Set(fetch.rows.map(doc => doc.doctor_id))];
    const placeHolders = doctorIds.map(() => "?").join(',');
    const fetchDoctors = await db.execute(`SELECT * FROM doctors WHERE admin_id = ? AND id IN (${placeHolders})`, [adminId, ...doctorIds]);
    const doctors = fetchDoctors.rows;
    const departments = [...new Set(fetchDoctors.rows.map(doc => doc.department))];

    if (doctors.length === 0 || departments.length === 0) return <StatusPage type="warning" message="No appointment slots are available at this clinic right now." backHref="/bookings" backLabel="Browse clinics" />;

    const fetchDocWithTreatment = await db.execute(`SELECT 
            d.id AS doctor_id,
            d.public_id AS doctor_public_id,
            d.name AS doctor_name,
            t.id AS treatment_id,
            t.public_id AS treatment_public_id,
            t.name AS treatment_name,
            t.duration
            FROM doctors d
            JOIN doctor_treatments dt 
            ON d.id = dt.doctor_id
            JOIN treatments t 
            ON t.id = dt.treatment_id
            WHERE d.admin_id = ?;`, [adminId]);

    const arr = [];
    fetchDocWithTreatment.rows.forEach(fn1 => {
        let doctor = arr.find(fn2 => fn2.doctor_id === fn1.doctor_id);
        if (!doctor) {
            arr.push({ doctor_id: fn1.doctor_id, doctor_public_id: fn1.doctor_public_id, doctor_name: fn1.doctor_name, treatments: [] });
            doctor = arr.find(fn2 => fn2.doctor_id === fn1.doctor_id);
        }
        doctor.treatments.push({ name: fn1.treatment_name, duration: fn1.duration, public_id: fn1.treatment_public_id });
    });

    return (
        <main className="page-shell">
            <div className="mb-8">
                <p className="soft-pill">Patient booking</p>
                <h1 className="mt-4 text-3xl font-black text-slate-950">{clinicName || "Clinic"} doctors</h1>
                <p className="mt-2 text-slate-600">Choose a department, doctor, and treatment to continue.</p>
            </div>

            <div className="grid gap-5">
                {departments.map(dep => (
                    <section key={dep} className="section-panel">
                        <h2 className="text-xl font-black text-slate-950">{fromHyphenSlug(dep)}</h2>
                        <details className="mt-4">
                            <summary>Show available doctors</summary>
                            <div className="mt-4 grid gap-4">
                                {doctors.filter(doc => doc.department === dep).map(doc => {
                                    const doctorWithTreatments = arr.find(d => d.doctor_id === doc.id);
                                    return (
                                        <div key={doc.public_id} className="data-card">
                                            <h3 className="text-lg font-bold text-slate-950">Dr. {fromHyphenSlug(doc.name, "Unknown")}</h3>
                                            <p className="mt-1 text-sm text-slate-600">Qualifications: {doc.qualifications ? JSON.parse(doc.qualifications).join(', ').toUpperCase() : "N/A"}</p>
                                            <div className="mt-4 flex flex-wrap gap-2">
                                                {doctorWithTreatments?.treatments.map(tr => (
                                                    <Link
                                                        key={tr.public_id}
                                                        className="btn-secondary"
                                                        href={`/bookings/${clinic_admin_pubId}/${doc.name.toLowerCase()}/${doc.public_id}/${tr.public_id}`}
                                                    >
                                                        {fromUnderscoreSlug(tr.name)} ({tr.duration} mins)
                                                    </Link>
                                                ))}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </details>
                    </section>
                ))}
            </div>
        </main>
    );
}
