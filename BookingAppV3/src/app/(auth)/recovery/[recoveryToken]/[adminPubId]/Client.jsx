"use client";

import Form from "next/form";
import { useActionState } from "react";
import { updateAdminPassword } from "./sa";

export default function ClientNewPassword({ adminPubId }) {
    const initialState = { ok: null, message: "" };
    const [state, formAction, isPending] = useActionState(updateAdminPassword, initialState);

    return (
        <>
            <Form action={formAction}>
                <input type="hidden" name="adminPubId" value={adminPubId} />
                <input type="password" name="password" placeholder="Enter new password" />
                <input type="password" name="confirm_password" placeholder="Confirm password" />
                {state.message && <p>{state.message}</p>}
                <button type="submit" disabled={isPending}>{isPending ? "Submitting..." : "Submit"}</button>
            </Form>
        </>
    );
}