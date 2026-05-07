import { getUser } from "@/app/lib/getUser";
import ClientSignUp from "./client";
import { redirect } from "next/navigation";



export default function SignUp() {

    const getCurrentUser = getUser();
    if (getCurrentUser?.id) return redirect("/settings");


    return (<>
        <ClientSignUp />
    </>)
}


