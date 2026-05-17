import { db } from "../lib/turso";
import ByDoctors from "../components/ByDoctors";
import { getUserPlus } from "../lib/getUser";
import { redirect } from "next/navigation";

export const metadata = {
    title: "Edit Templates",
    description: "Select a doctor to edit clinic schedule templates.",
};

export default async function EditTemplate() {

    const currentUser = await getUserPlus();
    if (!currentUser) return redirect("/login");
    if (!currentUser || currentUser.role !== "admin" || !currentUser.admin_id || currentUser.status !== "verified") redirect(`/verification/${currentUser?.admin_details?.public_id}`);
    const adminId = currentUser.admin_id;

    const fetchDoctors = await db.execute(`SELECT * FROM doctors WHERE admin_id = ?`, [adminId]);

    return (<main className="page-shell">
        <div className="mb-8">
            <p className="soft-pill">Schedule templates</p>
            <h1 className="mt-4 text-3xl font-black text-slate-950">Edit templates</h1>
            <p className="mt-2 text-slate-600">Choose a doctor to adjust weekly templates and future slot generation.</p>
        </div>
        <ByDoctors fetchedDoctors={fetchDoctors} navString="edit-template" />
    </main>);
}
