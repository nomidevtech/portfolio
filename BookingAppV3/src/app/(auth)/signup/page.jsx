import { getUser } from "@/app/lib/getUser";
import ClientSignUp from "./client";
import { redirect } from "next/navigation";

export const metadata = {
    title: "Create Clinic Account",
    description: "Create a ClinicFlow admin account for a clinic workspace.",
};



export default async function SignUp() {

    const getCurrentUser = await getUser();
    if (getCurrentUser?.id) return redirect("/settings");


    return (<>
        <ClientSignUp />
    </>)
}


