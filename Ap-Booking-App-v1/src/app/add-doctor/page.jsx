import Form from "next/form";
import { addDoctorServerAction } from "./SA";
import { db } from "../lib/turso";

export default async function AddDoctor() {

  const fetchDepartments = await db.execute("SELECT department FROM doctors");
  const departmentsArr = fetchDepartments?.rows?.map(r => r.department);
  const departments = [...new Set(departmentsArr)] ;

  return (<>
    <Form action={addDoctorServerAction}>
      <input type="text" name="name" placeholder="name" />
      <input type="text" name="title" placeholder="title" />
      < input list="departments" name="department" placeholder="department" />
      <datalist id="departments">
        {departments.map(department => <option key={department} value={department} />)}
      </datalist>
      <button type="submit">Submit</button>
    </Form>
  </>);
}