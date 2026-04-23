import Form from "next/form";
import { addTreatmentServerAction } from "./SA";
import { db } from "../lib/turso";
import { initTreatmentTable } from "../Models/initTables";

export default async function AddTreatment() {
    
    await initTreatmentTable();

    const fetchTreatmentsData = await db.execute(`SELECT * FROM treatments`);
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