'use client';

import { useActionState } from "react";
import Form from "next/form";
import { resendingAdminEmail, resendingPatientEmail } from "../lib/resendingEmail";

export function PatientEmailVerification({ bookingPubId, adminPubId }) {

    const [state, action, isPending] = useActionState(resendingPatientEmail, { ok: null, message: null });



    return (<>
        <Form action={action}>
            <input type="hidden" name="bookingPubId" value={bookingPubId} />
            <input type="hidden" name="adminPubId" value={adminPubId} />
            <button type="submit">{isPending ? "Sending..." : "Send Email Again⬅"}</button>
        </Form>
        {state.ok && !isPending && <p>Sent</p>}
    </>);
}




export function AdminEmailVerification({ adminPubId }) {

    const [state, action, isPending] = useActionState(resendingAdminEmail, { ok: null, message: null });



    return (<>
        <Form action={action}>
            <input type="hidden" name="adminPubId" value={adminPubId} />
            <button type="submit">{isPending ? "Sending..." : "Send Email Again⬅"}</button>
        </Form>
        {state.ok && !isPending && <p>Sent</p>}
    </>);
}
