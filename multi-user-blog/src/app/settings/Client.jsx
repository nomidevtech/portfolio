"use client";

import { startTransition, useActionState, useState } from "react";
import { updateUserSA } from "./SA";
import Form from "next/form";
import { checkUsername } from "../lib/checkUsername";
import { checkEmail } from "../lib/checkEmail";
import { emailOrchestrator } from "../lib/resend";
import Link from "next/link";
import { logout } from "../lib/logout";




export default function SettingsForm({ serializedUser }) {

    const initialState = { success: null, message: "" };

    const [state, formAction, isPending] = useActionState(updateUserSA, initialState);
    const [usernameState, usernameAction, usernamePending] = useActionState(checkUsername, initialState);
    const [emailState, emailAction, emailPending] = useActionState(checkEmail, initialState);

    const [sent, setSent] = useState(false);

    const user = JSON.parse(serializedUser);
    const isVerfied = user.email_verified === 1;

    return (<>

        {!isVerfied && <>
            <p className="text-red-400 text-sm">Email is not verified. Please verify your email to use to add posts.</p>
            <button onClick={() => { setSent(true); return emailOrchestrator(user.public_id, user.email) }}>Verify Email</button>
            {sent && <p className="text-green-400 text-sm">Email sent. Please check your inbox. And refresh the page.</p>}
        </>
        }


        {state.message && (<p >{state.message}</p>)}

        <Form action={formAction}>
            <input type="hidden" name="ppid" value={user.public_id} readOnly />
            <input name="name" defaultValue={user.name} />
            <input name="username" defaultValue={user.username} onBlur={(e) => startTransition(() => usernameAction(e.target.value))} />
            {usernamePending && <p>Checking username...</p>}
            {usernameState.message && <p>{usernameState.message}</p>}
            <input name="email" defaultValue={user.email} type="email" onBlur={(e) => startTransition(() => emailAction(e.target.value))} />
            {emailPending && <p>Checking email...</p>}
            {emailState.message && <p>{emailState.message}</p>}

            <button type="submit" disabled={isPending}>
                {isPending ? "Saving..." : "Save Changes"}
            </button>

        </Form>
        <Form action={logout}><button type="submit">Logout</button></Form>
        <Link href={'/delete_account'}>Delete Account</Link>
    </>
    );
}

