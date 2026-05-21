import { db } from "../lib/turso";
import { fromHyphenSlug, fromUnderscoreSlug } from "@/app/utils/displaySlug";
import Link from "next/link";
import { getUserPlus } from "../lib/getUser";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { CurrentDoctorsSkeleton } from "../components/Skeletons";
import ClientAddDoctor from "./Client";

export const metadata = {
    title: "Add Doctor",
    description: "Create doctor profiles and assign treatments in ClinicFlow.",
};

export default async function AddDoctor() {
    const currentUser = await getUserPlus();
    if (!currentUser) redirect("/login");
    if (currentUser.role !== "admin" || !currentUser.admin_id || currentUser.status !== "verified") {
        redirect(`/verification/${currentUser?.admin_details?.public_id || ""}`);
    }

    const adminId = currentUser.admin_id;

    const [deptRes, treatRes] = await Promise.all([
        db.execute(`SELECT DISTINCT department FROM doctors WHERE admin_id = ?`, [adminId]),
        db.execute(`SELECT public_id, name, duration FROM treatments WHERE admin_id = ?`, [adminId])
    ]);

    const departments = deptRes.rows.map(d => fromHyphenSlug(d.department));

    const treatments = treatRes.rows.map(t => ({
        treatmentPubId: t.public_id,
        string: `${fromUnderscoreSlug(t.name)} ${t.duration.toString().padStart(2, '0')} min`,
    }));

    return (
        <main className="page-shell">
            <ClientAddDoctor departments={departments} treatments={treatments} />

            <Suspense fallback={<div className="mt-6"><CurrentDoctorsSkeleton /></div>}>
                <CurrentDoctors adminId={adminId} />
            </Suspense>
        </main>
    );
}

async function CurrentDoctors({ adminId }) {
    const docRes = await db.execute(`SELECT * FROM doctors WHERE admin_id = ?`, [adminId]);

    if (docRes.rows.length === 0) return null;

    return (
        <details className="mt-6">
            <summary>Current Doctors</summary>
            <div className="mt-4 grid gap-3">
                {docRes.rows.map((doctor) => (
                    <div key={doctor.public_id} className="data-card">
                        <p className="font-semibold text-slate-900">
                            Dr. {fromHyphenSlug(doctor.name)}
                        </p>
                        <p className="mt-1 text-sm text-slate-600">
                            {JSON.parse(doctor.qualifications || "[]").join(", ").toUpperCase() || "No qualifications"} - {fromHyphenSlug(doctor.department)}
                        </p>
                        <Link href={`/edit-doctor/${doctor.public_id}`} className="mt-3 inline-flex font-semibold text-teal-800 hover:underline">
                            Edit doctor
                        </Link>
                    </div>
                ))}
            </div>
        </details>
    );
}
