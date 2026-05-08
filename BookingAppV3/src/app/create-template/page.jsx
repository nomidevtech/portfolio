import { db } from "../lib/turso";
import ByDoctors from "../components/ByDoctors";
import { getUserPlus } from "../lib/getUser";
import { redirect } from "next/navigation";

export default async function CreateTemplate() {

    const currentUser = await getUserPlus();
    if (!currentUser) return redirect("/login");
    if (!currentUser || currentUser.role !== "admin" || !currentUser.admin_id || currentUser.status !== "verified") redirect(`/verification/${currentUser?.admin_details?.public_id}`);
    const adminId = currentUser.admin_id;

    const fetchDoctors = await db.execute(`SELECT * FROM doctors WHERE admin_id = ?`, [adminId]);

    return (<>
        <ByDoctors fetchedDoctors={fetchDoctors} navString="create-template" />
    </>);
}