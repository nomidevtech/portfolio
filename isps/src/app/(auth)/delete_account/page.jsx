import { deleteAccount } from "@/app/lib/deleteAccount";
import { getUser } from "@/app/lib/getUser";
import Form from "next/form";
import Link from "next/link";
import DeleteClient from "./Client";


export default async function DeleteAccount() {

    const currentUser = await getUser();
    if (!currentUser?.id) return <p>You must <Link href="/login">login</Link></p>

    return (
        <DeleteClient />
    );
}