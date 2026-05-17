'use client';

import Form from "next/form";
import { patientResendCancelationEmail } from "./sa";
import { useActionState } from "react";

export default function ClientResendCancelBookingEmail({ bookingPubId }) {
  const [state, action, isPending] = useActionState(patientResendCancelationEmail, { ok: null, message: null });

  return (<>
    <p>A cancelation email has been sent to your provided email.</p>
    <Form action={action}>
      <input type="hidden" name="bookingPubId" value={bookingPubId} />
      <button type="submit">{isPending ? "Sending..." : "Send Email Again⬅"}</button>
    </Form>
    {state.ok && !isPending && <p>Sent</p>}
  </>);
}