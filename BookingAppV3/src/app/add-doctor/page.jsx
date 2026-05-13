import { db } from "../lib/turso";
import Link from "next/link";
import { getUserPlus } from "../lib/getUser";
import { redirect } from "next/navigation";
import ClientAddDoctor from "./Client";


export default async function AddDoctor() {
    const currentUser = await getUserPlus();
    if (!currentUser) redirect("/login");
    if (currentUser.role !== "admin" || !currentUser.admin_id || currentUser.status !== "verified") {
        redirect(`/verification/${currentUser?.admin_details?.public_id || ""}`);
    }

    const adminId = currentUser.admin_id;

    const [deptRes, treatRes, docRes] = await Promise.all([
        db.execute(`SELECT DISTINCT department FROM doctors WHERE admin_id = ?`, [adminId]),
        db.execute(`SELECT public_id, name, duration FROM treatments WHERE admin_id = ?`, [adminId]),
        db.execute(`SELECT * FROM doctors WHERE admin_id = ?`, [adminId])
    ]);

    const departments = deptRes.rows.map(d =>
        d.department.charAt(0).toUpperCase() + d.department.slice(1)
    );

    const treatments = treatRes.rows.map(t => ({
        treatmentPubId: t.public_id,
        string: `${t.name.split("_").map(w => w[0].toUpperCase() + w.slice(1)).join(" ")} ${t.duration.toString().padStart(2, '0')} min`,
    }));

    return (
        <>
            <ClientAddDoctor departments={departments} treatments={treatments} />

            {docRes.rows.length > 0 && (
                <details className="mt-4">
                    <summary>Current Doctors</summary>
                    {docRes.rows.map((doctor) => (
                        <div key={doctor.public_id} className="border-2 p-2 my-1">
                            <p>
                                Name: Dr. {doctor.name.charAt(0).toUpperCase() + doctor.name.slice(1)} -
                                Qualifications: {JSON.parse(doctor.qualifications || "[]").join(", ").toUpperCase()} -
                                Dept: {doctor.department}
                            </p>
                            <Link href={`/edit-doctor/${doctor.public_id}`}>Edit⬅</Link>
                        </div>
                    ))}
                </details>
            )}
        </>
    );
}