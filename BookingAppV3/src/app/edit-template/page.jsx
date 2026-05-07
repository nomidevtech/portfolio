import { db } from "../lib/turso";
import ByDoctors from "../components/ByDoctors";
import { getUserPlus } from "../lib/getUser";
import { redirect } from "next/navigation";

export default async function EditTemplate() {

    const currentUser = await getUserPlus();
    if (!currentUser || currentUser.role !== "admin" || !currentUser.admin_id) redirect("/login");
    const adminId = currentUser.admin_id;

    const fetchDoctors = await db.execute(`SELECT * FROM doctors WHERE admin_id = ?`, [adminId]);

    return (<>
        <ByDoctors fetchedDoctors={fetchDoctors} navString="edit-template" />
    </>);
}