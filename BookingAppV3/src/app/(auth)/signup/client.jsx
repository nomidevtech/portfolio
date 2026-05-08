'use client'
import Form from "next/form";
import { useActionState } from "react";
import { signupServerAction } from "./sa";


export default function ClientSignUp() {

    const [state, action, isPending] = useActionState(signupServerAction, { ok: false, message: null })

    return (<>
        <Form action={action}>
            <input type="text" name="full_name" placeholder="Full Name" />
            <input type="text" name="admin_email" placeholder="admin@email.com" />
            <input type="text" name="username" placeholder="Username" />
            <input type="password" name="password" placeholder="Password" />
            <input type="password" name="confirm_password" placeholder="Confirm Password" />
            <input type="text" name="clinic_name" placeholder="Clinic Name" />
            <input type="tel" name="clinic_phone" placeholder="Clinic phone" />
            <input type="text" name="clinic_address" placeholder="Clinic Address" />
            <button type="submit">Sign Up</button>
        </Form>
    </>)
}


