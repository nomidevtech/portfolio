'use client';

import Form from "next/form";
import { patientResendCancelationEmail } from "./sa";
import { useActionState } from "react";

export default function ClientResendCancelBookingEmail({ bookingPubId, adminPubId }) {
  const [state, action, isPending] = useActionState(patientResendCancelationEmail, { ok: null, message: null });

  return (
    <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4">
      <p className="text-sm font-semibold text-slate-700">A cancellation email has been sent to your provided email.</p>
      <Form action={action} className="mt-3">
        <input type="hidden" name="bookingPubId" value={bookingPubId} />
        <input type="hidden" name="adminPubId" value={adminPubId} />
        <button type="submit" className="btn-secondary" disabled={isPending}>
          {isPending ? "Sending..." : "Send email again"}
        </button>
      </Form>
      {state.ok && !isPending && <p className="mt-3 text-sm font-semibold text-emerald-800">Sent</p>}
    </div>
  );
}
