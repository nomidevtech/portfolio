import Form from "next/form";
import { db } from "../lib/turso";
import { initDoctorTable } from "../Models/initTables";
import { addDoctorServerAction } from "./SA";

export default async function AddDoctor() {
    await initDoctorTable();

    const fetchDepartments = await db.execute(`SELECT department FROM doctors`);
    let departments = fetchDepartments?.rows;
    departments = departments.map(dep => dep.department[0].toUpperCase() + dep.department.slice(1).toLowerCase());
    departments = [...new Set(departments)];

    return (<>
        <Form action={addDoctorServerAction}>
            <input type="text" name="name" placeholder="Name" />
            <input list="departments" name="department" placeholder="Department" />
            <datalist id="departments">
                {departments?.map((dep, idx) => <option key={idx} value={dep} />)}
            </datalist>
            <input type="submit" value="Submit" />
        </Form>
    </>);
}