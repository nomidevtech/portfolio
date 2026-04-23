import { db } from "../lib/turso";
import ByDoctors from "../components/ByDoctors";

export default async function EditTemplate() {

    const fetchDoctors = await db.execute(`SELECT * FROM doctors`);

    return (<>
        <ByDoctors fetchedDoctors={fetchDoctors} navString="edit-template" />
    </>);
}