import { getUser } from "@/app/lib/getUser";
import ClientSignUp from "./client";
import { redirect } from "next/navigation";



export default async function SignUp() {

    const getCurrentUser = await getUser();
    if (getCurrentUser?.id) return redirect("/settings");


    return (<>
        <ClientSignUp />
    </>)
}


