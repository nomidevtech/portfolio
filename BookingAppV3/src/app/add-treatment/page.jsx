import { db } from "../lib/turso";
import { fromUnderscoreSlug } from "@/app/utils/displaySlug";
import { getUserPlus } from "../lib/getUser";
import { redirect } from "next/navigation";
import ClientAddTreatment from "./Client";

export const metadata = {
    title: "Add Treatment",
    description: "Create clinic treatments and durations for appointment booking.",
};

export default async function AddTreatment() {
    const currentUser = await getUserPlus();
    if (!currentUser) return redirect("/login");
    if (currentUser.role !== "admin" || !currentUser.admin_id || currentUser.status !== "verified") redirect(`/verification/${currentUser?.admin_details?.public_id}`);

    const adminId = currentUser.admin_id;

    const fetchTreatmentsData = await db.execute(`SELECT * FROM treatments WHERE admin_id = ?`, [adminId]);
    const treatments = fetchTreatmentsData?.rows.map(treatment => ({
        name: fromUnderscoreSlug(treatment.name),
        rawName: treatment.name,
        duration: treatment.duration,
        publicId: treatment.public_id
    }));

    return <ClientAddTreatment treatments={treatments} />;
}
