"use client";

import Form from "next/form";
import { useActionState } from "react";
import { changeAdminEmailSA } from "./sa";
import Link from "next/link";

export default function ClientAdminVerification({ adminPubId, admin_email, status }) {
    const initialState = { ok: null, message: "" };
    const [state, formAction, isPending] = useActionState(changeAdminEmailSA, initialState);

    return (
        <>
            <p>Email: {admin_email}</p>
            <p>Status: {status}</p>
            <details>
                <summary>Change Email</summary>
                <Form action={formAction}>
                    <input type="hidden" name="adminPubId" value={adminPubId} />
                    <input type="email" name="email" placeholder="Email" />
                    {state.message && (
                        <>
                            <p>{state.message}</p>
                            {state.redirectUrl && <Link href={state.redirectUrl}>Click here</Link>}
                        </>
                    )}
                    <button disabled={isPending}>{isPending ? "Changing..." : "Change"}</button>
                </Form>
            </details>
        </>
    );
}