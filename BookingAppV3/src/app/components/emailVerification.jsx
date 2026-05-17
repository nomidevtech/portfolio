'use client';

import { useActionState } from "react";
import Form from "next/form";
import { resendingAdminEmail, resendingPatientEmail } from "../lib/resendingEmail";

export function PatientEmailVerification({ bookingPubId, adminPubId }) {
    const [state, action, isPending] = useActionState(resendingPatientEmail, { ok: null, message: null });

    return (
        <div className="mt-4 rounded-2xl border border-emerald-100 bg-emerald-50 p-4">
            <Form action={action}>
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

export function AdminEmailVerification({ adminPubId }) {
    const [state, action, isPending] = useActionState(resendingAdminEmail, { ok: null, message: null });

    return (
        <section className="section-panel mt-5">
            <h2 className="text-lg font-bold text-slate-950">Verification email</h2>
            <p className="mt-1 text-sm text-slate-600">Resend the email if the current link was missed or expired.</p>
            <Form action={action} className="mt-4">
                <input type="hidden" name="adminPubId" value={adminPubId} />
                <button type="submit" className="btn-secondary" disabled={isPending}>
                    {isPending ? "Sending..." : "Send email again"}
                </button>
            </Form>
            {state.ok && !isPending && <p className="mt-3 text-sm font-semibold text-emerald-800">Sent</p>}
        </section>
    );
}
