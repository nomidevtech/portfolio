import { db } from "@/app/lib/turso";
import { addDoctorTreatment, deleteDoctor, editDoctorServerAction, removeDoctorTreatment } from "./sa";
import Form from "next/form";
import { getUserPlus } from "@/app/lib/getUser";
import { redirect } from "next/navigation";

export default async function EditDoctor({ params }) {

    const currentUser = await getUserPlus();
    if (!currentUser) return redirect("/login");
    if (!currentUser || currentUser.role !== "admin" || !currentUser.admin_id || currentUser.status !== "verified") redirect(`/verification/${currentUser?.admin_details?.public_id}`);
    const adminId = currentUser.admin_id;

    const { docPubId } = await params;

    const fetchDoctor = await db.execute(
        `SELECT id FROM doctors WHERE admin_id = ? AND public_id = ?`,
        [adminId, docPubId]
    );

    if (fetchDoctor.rows.length === 0) {
        return <p>Broken link. Doctor not found.</p>;
    }

    const doctorId = fetchDoctor.rows[0].id;

    const fetchDepartments = await db.execute(`SELECT department FROM doctors WHERE admin_id = ?`, [adminId]);
    let departments = fetchDepartments?.rows.map(dep => dep.department[0].toUpperCase() + dep.department.slice(1).toLowerCase());
    departments = [...new Set(departments)];

    const fetchTreatments = await db.execute(`SELECT public_id, name, duration FROM treatments WHERE admin_id = ?`, [adminId]);

    const fetchDetails = await db.execute(`
        SELECT 
            doctors.name AS doctor_name, doctors.username AS doctor_username,
            GROUP_CONCAT(treatments.public_id) AS treatments,
            doctors.*
        FROM doctors
        LEFT JOIN doctor_treatments ON doctors.id = doctor_treatments.doctor_id 
            AND doctors.admin_id = doctor_treatments.admin_id
        LEFT JOIN treatments ON doctor_treatments.treatment_id = treatments.id
        WHERE doctors.admin_id = ? AND doctors.id = ?
    `, [adminId, doctorId]);

    const doctorData = fetchDetails.rows[0];

    const treatmentPubIds = doctorData.treatments ? doctorData.treatments.split(",") : [];

    const formatTreatment = (t) => ({
        name: t.name,
        duration: t.duration,
        public_id: t.public_id,
        string: t.name.split("_").map(w => w[0].toUpperCase() + w.slice(1)).join(" ") +
            " " + (t.duration > 9 ? t.duration + " min" : `0${t.duration} min`)
    });

    const assignedTreatments = fetchTreatments?.rows
        ?.filter(t => treatmentPubIds.includes(t.public_id))
        ?.map(formatTreatment);

    const availableTreatments = fetchTreatments?.rows
        ?.filter(t => !treatmentPubIds.includes(t.public_id))
        ?.map(formatTreatment);

    const qualifications = doctorData.qualifications ? JSON.parse(doctorData.qualifications) : [];

    return (
        <>
            <div>Editing: {doctorData?.doctor_name}</div>

            <label>Add Additional Treatments</label>
            <Form action={addDoctorTreatment}>
                <input type="hidden" name="doctor_pubId" value={docPubId} />
                <select name="treatment">
                    <option>Select Additional Treatments</option>
                    {availableTreatments?.map((fn, idx) => <option key={idx} value={fn.public_id}>{fn.string}</option>)}
                </select>
                <button type="submit">Add</button>
            </Form>

            <label>Remove Treatments</label>
            <Form action={removeDoctorTreatment}>
                <input type="hidden" name="doctor_pubId" value={docPubId} />
                <select name="remove_treatment">
                    <option>Select Treatments to Remove</option>
                    {assignedTreatments?.map((fn, idx) => <option key={idx} value={fn.public_id}>{fn.string}</option>)}
                </select>
                <button type="submit">Remove</button>
            </Form>

            <Form action={editDoctorServerAction}>
                <input type="hidden" name="doctor_pubId" value={docPubId} />
                <input type="text" name="name" placeholder="Name" defaultValue={doctorData.doctor_name[0].toUpperCase() + doctorData.doctor_name.slice(1)} />
                <input type="text" name="username" placeholder="userame" defaultValue={doctorData.doctor_username} />
                <input type="text" name="new_password" placeholder="New Password" />
                <input list="departments" name="department" placeholder="Department" defaultValue={doctorData.department[0].toUpperCase() + doctorData.department.slice(1)} />
                <datalist id="departments">
                    {departments?.map((dep, idx) => <option key={idx} value={dep} />)}
                </datalist>
                <input type="text" name="qualification" placeholder="Qualifications" defaultValue={qualifications.join(", ")} />
                <input type="submit" value="Submit" />
            </Form>

            <div>
                <p>Name: {doctorData.doctor_name[0].toUpperCase() + doctorData.doctor_name.slice(1)}</p>
                <p>Department: {doctorData.department[0].toUpperCase() + doctorData.department.slice(1)}</p>
                <p>Qualifications: {qualifications.join(", ").toUpperCase() || "None"}</p>
                <p>Treatments: {assignedTreatments?.length > 0 ? assignedTreatments.map(t => t.string).join(", ") : "None"}</p>
            </div>

            <Form action={deleteDoctor}>
                <input type="hidden" name="doctor_pubId" value={docPubId} />
                <button type="submit">Delete Doctor</button>
            </Form>
        </>
    );
}