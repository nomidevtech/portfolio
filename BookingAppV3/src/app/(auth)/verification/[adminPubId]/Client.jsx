"use client";

import Form from "next/form";
import { useActionState } from "react";
import { changeAdminEmailSA } from "./sa";
import Link from "next/link";

export default function ClientAdminVerification({ adminPubId, admin_email, status }) {
    const initialState = { ok: null, message: "" };
    const [state, formAction, isPending] = useActionState(changeAdminEmailSA, initialState);

    return (
        <section className="section-panel">
            <p className="soft-pill">Admin verification</p>
            <h1 className="mt-4 text-2xl font-black text-slate-950">Verify your clinic email</h1>
            <dl className="mt-5 grid gap-3 text-sm sm:grid-cols-2">
                <div className="rounded-2xl bg-emerald-50 p-4">
                    <dt className="font-bold text-slate-500">Email</dt>
                    <dd className="mt-1 font-semibold text-slate-950">{admin_email}</dd>
                </div>
                <div className="rounded-2xl bg-emerald-50 p-4">
                    <dt className="font-bold text-slate-500">Status</dt>
                    <dd className="mt-1 font-semibold capitalize text-slate-950">{status}</dd>
                </div>
            </dl>

            <details className="mt-5">
                <summary>Change email address</summary>
                <Form action={formAction} className="mt-4 grid gap-4">
                    <input type="hidden" name="adminPubId" value={adminPubId} />
                    <label className="grid gap-1.5">
                        <span className="field-label">New email</span>
                        <input type="email" name="email" placeholder="admin@email.com" />
                    </label>
                    {state.message && (
                        <div className={state.ok ? "status-success" : "status-error"}>
                            <p>{state.message}</p>
                            {state.redirectUrl && <Link href={state.redirectUrl} className="font-bold underline">Continue</Link>}
                        </div>
                    )}
                    <button className="btn-primary w-full sm:w-auto" disabled={isPending}>
                        {isPending ? "Changing..." : "Change email"}
                    </button>
                </Form>
            </details>
        </section>
    );
}
