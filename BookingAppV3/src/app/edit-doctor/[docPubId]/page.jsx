import { db } from "@/app/lib/turso";
import { addDoctorTreatment, deleteDoctor, editDoctorServerAction, removeDoctorTreatment } from "./sa";
import Form from "next/form";
import Link from "next/link";

export default async function EditDoctor({ params }) {
    const { docPubId } = await params;
    const adminId = 1;

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

    const fetchTreatments = await db.execute(`SELECT name, duration FROM treatments WHERE admin_id = ?`, [adminId]);
    const treatments = fetchTreatments?.rows.map(fn => fn.name[0].toUpperCase() + fn.name.slice(1).toLowerCase() + " - " + fn.duration + "min");

    const fetchDetails = await db.execute(`
        SELECT 
            doctors.name AS doctor_name,
            GROUP_CONCAT(treatments.name || ' - ' || treatments.duration || 'min') AS treatments,
            doctors.*
        FROM doctors
        LEFT JOIN doctor_treatments ON doctors.id = doctor_treatments.doctor_id 
            AND doctors.admin_id = doctor_treatments.admin_id
        LEFT JOIN treatments ON doctor_treatments.treatment_id = treatments.id
        WHERE doctors.admin_id = ? AND doctors.id = ?
    `, [adminId, doctorId]);

    const doctorData = fetchDetails.rows[0];

    const treatmentsArr = doctorData.treatments
        ? doctorData.treatments.split(',').map(t => t[0].toUpperCase() + t.slice(1))
        : [];

    const qualifications = doctorData.qualifications ? JSON.parse(doctorData.qualifications) : [];

    return (
        <>
            <div>Editing: {doctorData?.doctor_name}</div>

            <label>Add Additional Treatments</label>
            <Form action={addDoctorTreatment}>
                <input type="hidden" name="doctor_pubId" value={docPubId} />
                <select name="treatment">
                    <option>Select Additional Treatments</option>
                    {treatments?.map((treatment, idx) => <option key={idx} value={treatment}>{treatment}</option>)}
                </select>
                <button type="submit">Add</button>
            </Form>

            <label>Remove Treatments</label>
            <Form action={removeDoctorTreatment}>
                <input type="hidden" name="doctor_pubId" value={docPubId} />
                <select name="remove_treatment">
                    <option>Select Treatments to Remove</option>
                    {treatmentsArr?.map((treatment, idx) => <option key={idx} value={treatment}>{treatment}</option>)}
                </select>
                <button type="submit">Remove</button>
            </Form>

            <Form action={editDoctorServerAction}>
                <input type="hidden" name="doctor_pubId" value={docPubId} />
                <input type="text" name="name" placeholder="Name" defaultValue={doctorData.doctor_name[0].toUpperCase() + doctorData.doctor_name.slice(1)} />
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
                <p>Treatments: {doctorData.treatments || 'None'}</p>
            </div>

            <Form action={deleteDoctor}>
                <input type="hidden" name="doctor_pubId" value={docPubId} />
                <button type="submit">Delete Doctor</button>
            </Form>
        </>
    );
}