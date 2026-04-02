import { getUser } from "@/app/lib/getUser";
import SignUpClientComponent from "./SUCC";
import { redirect } from "next/navigation";
import { initAdminsTable, initBilling_transactionsTable, initPlansTable, initSessionsTable, initUsersTable } from "@/app/models/table-inits";

export default async function SignUp() {

    await initAdminsTable();
    await initSessionsTable();
    await initPlansTable();
    await initUsersTable();
    await initBilling_transactionsTable();


    const currentUser = await getUser();
    if (currentUser?.id) return redirect("/settings");


    return (
        <SignUpClientComponent />
    );
}