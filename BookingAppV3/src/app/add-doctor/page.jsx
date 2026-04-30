import Form from "next/form";
import { db } from "../lib/turso";
import { initDoctorTreatmentsTable, initDoctorTable, initTreatmentTable, initBookingsTable } from "../Models/initTables";
import { addDoctorServerAction } from "./SA";
import Link from "next/link";

export default async function AddDoctor() {
    await initBookingsTable();
    await initDoctorTable();
    await initTreatmentTable();
    await initDoctorTreatmentsTable();

    const fetchDepartments = await db.execute(`SELECT department FROM doctors`);
    let departments = fetchDepartments?.rows;
    departments = departments.map(dep => dep.department[0].toUpperCase() + dep.department.slice(1).toLowerCase());
    departments = [...new Set(departments)];

    const fetchTreatments = await db.execute(`SELECT name, duration FROM treatments`);
    const treatments = fetchTreatments?.rows.map(fn => fn.name[0].toUpperCase() + fn.name.slice(1).toLowerCase() + " - " + fn.duration + "min");

    const fetchAllDoctors = await db.execute(`SELECT * FROM doctors`);
    const allDoctors = fetchAllDoctors.rows;


    return (<>
        <Form action={addDoctorServerAction}>
            <input type="text" name="name" placeholder="Name" />
            <input type="text" name="qualification" placeholder="Qualifications: MD, Surgeon" />
            <input list="departments" name="department" placeholder="Department" />
            <datalist id="departments">
                {departments?.map((dep, idx) => <option key={idx} value={dep} />)}
            </datalist>
            <select name="treatment" placeholder="Treatments" >
                {treatments?.map((treatment, idx) => <option key={idx} value={treatment}>{treatment}</option>)}
            </select>
            <input type="submit" value="Submit" />
        </Form>
        {allDoctors?.length > 0 && (
            <details>
                <summary>Current Doctors</summary>
                {allDoctors.map((doctor) => (
                    <div key={doctor.public_id} className="border-2">
                        <p>
                            Name: Dr. {doctor.name.charAt(0).toUpperCase() + doctor.name.slice(1)} -
                            Qualifications: {JSON.parse(doctor.qualifications || "[]").join(", ").toUpperCase()} -
                            Department: {doctor.department.charAt(0).toUpperCase() + doctor.department.slice(1)}
                        </p>
                        <Link href={`/edit-doctor/${doctor.public_id}`}>Edit⬅</Link>
                    </div>
                ))}
            </details>
        )}
    </>);
}