import { db } from "../lib/turso";
import ByDoctors from "../components/ByDoctors";

export default async function EditDoctors() {

    const fetchDoctors = await db.execute(`SELECT * FROM doctors`);

    return (<>
        <ByDoctors fetchedDoctors={fetchDoctors} navString="edit-doctor" />
    </>);
}