import { getUser } from "@/app/lib/getUser";
import DeleteClient from "./Client";
import { redirect } from "next/navigation";

export const metadata = {
    title: "Delete Account - NetAdmin",
    description: "Permanently remove your NetAdmin account.",
};

export default async function DeleteAccount() {

    const currentUser = await getUser();
    if (!currentUser?.id) redirect("/login");

    return (
        <DeleteClient />
    );
}