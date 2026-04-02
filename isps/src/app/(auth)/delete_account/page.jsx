import { getUser } from "@/app/lib/getUser";
import DeleteClient from "./Client";
import { redirect } from "next/navigation";



export default async function DeleteAccount() {

    const currentUser = await getUser();
    if (!currentUser?.id) redirect("/login");

    return (
        <DeleteClient />
    );
}