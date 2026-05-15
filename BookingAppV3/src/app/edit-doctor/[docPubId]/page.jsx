import { db } from "@/app/lib/turso";
import { getUserPlus } from "@/app/lib/getUser";
import { redirect } from "next/navigation";
import ClientEditDoctor from "./Client";

export default async function EditDoctor({ params }) {
    const currentUser = await getUserPlus();
    if (!currentUser) return redirect("/login");
    if (currentUser.role !== "admin" || !currentUser.admin_id || currentUser.status !== "verified") {
        redirect(`/verification/${currentUser?.admin_details?.public_id}`);
    }

    const adminId = currentUser.admin_id;
    const { docPubId } = await params;

    const fetchDoctor = await db.execute(
        `SELECT id FROM doctors WHERE admin_id = ? AND public_id = ?`,
        [adminId, docPubId]
    );

    if (fetchDoctor.rows.length === 0) return <p>Broken link. Doctor not found.</p>;

    const doctorId = fetchDoctor.rows[0].id;
    const fetchDepartments = await db.execute(`SELECT department FROM doctors WHERE admin_id = ?`, [adminId]);
    const departments = [...new Set(fetchDepartments?.rows.map(dep => dep.department[0].toUpperCase() + dep.department.slice(1).toLowerCase()))];
    const fetchTreatments = await db.execute(`SELECT public_id, name, duration FROM treatments WHERE admin_id = ?`, [adminId]);

    const fetchDetails = await db.execute(`
        SELECT doctors.name AS doctor_name, doctors.username AS doctor_username,
               GROUP_CONCAT(treatments.public_id) AS treatments, doctors.*
        FROM doctors
        LEFT JOIN doctor_treatments ON doctors.id = doctor_treatments.doctor_id AND doctors.admin_id = doctor_treatments.admin_id
        LEFT JOIN treatments ON doctor_treatments.treatment_id = treatments.id
        WHERE doctors.admin_id = ? AND doctors.id = ?
    `, [adminId, doctorId]);

    const doctorData = JSON.parse(JSON.stringify(fetchDetails.rows[0]));
    const treatmentPubIds = doctorData.treatments ? doctorData.treatments.split(",") : [];

    const formatTreatment = (t) => ({
        public_id: t.public_id,
        string: t.name.split("_").map(w => w[0].toUpperCase() + w.slice(1)).join(" ") + " " + (t.duration > 9 ? t.duration + " min" : `0${t.duration} min`)
    });

    const assignedTreatments = fetchTreatments?.rows?.filter(t => treatmentPubIds.includes(t.public_id)).map(formatTreatment);
    const availableTreatments = fetchTreatments?.rows?.filter(t => !treatmentPubIds.includes(t.public_id)).map(formatTreatment);
    const qualifications = doctorData.qualifications ? JSON.parse(doctorData.qualifications) : [];

    return (
        <ClientEditDoctor
            docPubId={docPubId}
            doctorData={doctorData}
            departments={departments}
            assignedTreatments={assignedTreatments}
            availableTreatments={availableTreatments}
            qualifications={qualifications}
        />
    );
}