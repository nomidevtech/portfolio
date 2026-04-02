import { getUser } from "@/app/lib/getUser";
import DeleteClient from "./Client";
import { redirect } from "next/dist/server/api-utils";


export default async function DeleteAccount() {

    const currentUser = await getUser();
    if (!currentUser?.id) redirect("/login");

    return (
        <DeleteClient />
    );
}