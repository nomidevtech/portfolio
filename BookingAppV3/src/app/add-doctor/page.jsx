import Form from "next/form";
import { db } from "../lib/turso";
import { initDoctorTreatmentsTable, initDoctorTable, initTreatmentTable } from "../Models/initTables";
import { addDoctorServerAction } from "./SA";

export default async function AddDoctor() {
    await initDoctorTable();
    await initTreatmentTable();
    await initDoctorTreatmentsTable();

    const fetchDepartments = await db.execute(`SELECT department FROM doctors`);
    let departments = fetchDepartments?.rows;
    departments = departments.map(dep => dep.department[0].toUpperCase() + dep.department.slice(1).toLowerCase());
    departments = [...new Set(departments)];

    const fetchTreatments = await db.execute(`SELECT name, duration FROM treatments`);
    const treatments = fetchTreatments?.rows.map(fn => fn.name[0].toUpperCase() + fn.name.slice(1).toLowerCase() + " - " + fn.duration + "min");


    return (<>
        <Form action={addDoctorServerAction}>
            <input type="text" name="name" placeholder="Name" />
            <input list="departments" name="department" placeholder="Department" />
            <datalist id="departments">
                {departments?.map((dep, idx) => <option key={idx} value={dep} />)}
            </datalist>
            <select name="treatment" placeholder="Treatments" >
                {treatments?.map((treatment, idx) => <option key={idx} value={treatment}>{treatment}</option>)}
            </select>
            <input type="submit" value="Submit" />
        </Form>
    </>);
}