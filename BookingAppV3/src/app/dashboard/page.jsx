import { redirect } from "next/navigation";
import { getUser, getUserPlus } from "../lib/getUser";
import AdminComponent from "./admin-component";
import DoctorComponent from "./doctor-component";

export default async function Dashboard() {

    const currentUser = await getUserPlus();
    if (!currentUser?.id) return redirect("/login");

    return (<>
        {currentUser.role === "admin" && <AdminComponent currentUser={currentUser} />}
        {currentUser.role === "doctor" && <DoctorComponent currentUser={currentUser} />}
    </>);

}