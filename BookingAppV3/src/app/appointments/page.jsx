import { redirect } from "next/navigation";
import { getUserPlus } from "../lib/getUser";
import AdminComponent from "./admin-component";
import DoctorComponent from "./doctor-component";

export const metadata = {
    title: "Appointments",
    description: "View and manage active clinic appointments.",
};

export default async function Appointments() {

    const currentUser = await getUserPlus();
    if (!currentUser?.id) return redirect("/login");



    if (currentUser.role === "doctor") {
        if (currentUser.status !== "verified") return <main className="page-shell"><p className="status-warning">Your account is not verified. Please contact the admin.</p></main>
        return <DoctorComponent currentUser={currentUser} />
    }


    if (currentUser.role !== "admin" || !currentUser.admin_id || currentUser.status !== "verified") redirect(`/verification/${currentUser?.admin_details?.public_id}`);


    return <AdminComponent currentUser={currentUser} />


} 
