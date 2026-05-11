import { redirect } from "next/navigation";
import { getUserPlus } from "../lib/getUser";
import AdminComponent from "./admin-component";
import DoctorComponent from "./doctor-component";

export default async function Appointments() {

    const currentUser = await getUserPlus();
    if (!currentUser?.id) return redirect("/login");



    if (currentUser.role === "doctor") return <DoctorComponent currentUser={currentUser} />


    if (currentUser.role !== "admin" || !currentUser.admin_id || currentUser.status !== "verified") redirect(`/verification/${currentUser?.admin_details?.public_id}`);


    return <AdminComponent currentUser={currentUser} />


} 