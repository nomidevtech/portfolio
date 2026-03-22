import { deleteAccount } from "@/app/lib/deleteAccount";
import Form from "next/form";


export default function DeleteAccount() {
    return (
        <>
        This action is irreversible. You will have to create a new account to continue using our services.
        <Form action={deleteAccount}>
            <button type="submit">Delete Account</button>
        </Form> 
        </>
    );
}