import { getUser } from "@/app/lib/getUser";
import SignUpClientComponent from "./SUCC";
import { redirect } from "next/navigation";
import { initAllTables } from "@/app/models/tablesInit";

export default async function SignUp() {

    await initAllTables();

    const currentUser = await getUser();
    if (currentUser?.id) return redirect("/settings");

    return (
        <SignUpClientComponent />
    );
}
