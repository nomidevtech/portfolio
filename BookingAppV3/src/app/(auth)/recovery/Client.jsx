'use client';

import Form from "next/form";
import { useActionState } from "react";
import { findEMail } from "./sa";

export default function ClientRecovery() {
    const [state, action, isPending] = useActionState(findEMail, { ok: null, message: null });

    return (
        <>
            {state.message && <p>{state.message}</p>}
            {!state.ok && (
                <Form action={action}>
                    <input type="text" name="email" placeholder="Enter your email" />
                    <button type="submit">Submit</button>
                </Form>
            )}
        </>
    );
}