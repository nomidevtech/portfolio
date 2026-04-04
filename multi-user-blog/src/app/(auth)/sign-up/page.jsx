import { getUser } from "@/app/lib/getUser";
import SignUpClientComponent from "./SUCC";
import { redirect } from "next/navigation";

export default async function SignUp() {

    const currentUser = await getUser();
    if (currentUser?.id) return redirect("/settings");


    return (
        <SignUpClientComponent />
    );
}