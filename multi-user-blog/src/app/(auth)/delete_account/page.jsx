import { deleteAccount } from "@/app/lib/deleteAccount";
import { getUser } from "@/app/lib/getUser";
import Form from "next/form";
import Link from "next/link";


export default async function DeleteAccount() {

    const currentUser = await getUser();
    if (!currentUser?.id) return <p>You must <Link href="/login">login</Link></p>

    return (
        <>
            This action is irreversible. You will have to create a new account to continue using our services.
            <Form action={deleteAccount}>
                <button type="submit">Delete Account</button>
            </Form>
        </>
    );
}