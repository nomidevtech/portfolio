'use client';

import { useActionState } from "react";
import Form from "next/form";
import { resendingEmail } from "../lib/resendingEmail";

export default function EmailVerification({ bookingPubId }) {

    const [state, action, isPending] = useActionState(resendingEmail, { ok: null, message: null });



    return (<>
        <Form action={action}>
            <input type="hidden" name="bookingPubId" value={bookingPubId} />
            <button type="submit">{isPending ? "Sending..." : "Send Email Again⬅"}</button>
        </Form>
        {state.ok && !isPending && <p>Sent</p>}
    </>);
}