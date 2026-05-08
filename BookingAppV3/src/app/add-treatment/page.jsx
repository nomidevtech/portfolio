import Form from "next/form";
import { addTreatmentServerAction } from "./SA";
import { db } from "../lib/turso";
import { initTreatmentTable } from "../Models/initTables";
import { getUserPlus } from "../lib/getUser";
import { redirect } from "next/navigation";

export default async function AddTreatment() {

    //await initTreatmentTable();

    const currentUser = await getUserPlus();
    if(!currentUser) return redirect("/login");
    if (!currentUser || currentUser.role !== "admin" || !currentUser.admin_id || currentUser.status !== "verified") redirect(`/verification/${currentUser?.admin_details?.public_id}`);
    const adminId = currentUser.admin_id;

    const fetchTreatmentsData = await db.execute(`SELECT * FROM treatments WHERE admin_id = ?`, [adminId]);
    let treatments = fetchTreatmentsData?.rows;
    treatments = treatments.map(treatment => ({ name: treatment.name[0].toUpperCase() + treatment.name.slice(1).toLowerCase(), duration: treatment.duration }));


    return (<>
        <Form action={addTreatmentServerAction}>
            <input type="text" name="name" placeholder="Name" />
            <input type="number" name="duration" placeholder="Duration" />
            <input type="submit" value="Submit" />
        </Form>
        {treatments?.length > 0 && <>
            <h2>Current Treatments</h2>
            {treatments?.map((treatment, idx) => <p key={idx}>Type: {treatment.name} - Duration: {Math.round(treatment.duration)}min</p>)}
        </>}
    </>);
}