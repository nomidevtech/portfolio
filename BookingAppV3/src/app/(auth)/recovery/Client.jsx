'use client';

import Form from "next/form";
import { useActionState } from "react";
import { findEMail } from "./sa";

export default function ClientRecovery() {
    const [state, action, isPending] = useActionState(findEMail, { ok: null, message: null });

    return (
        <main className="page-shell-narrow">
            <div className="mx-auto max-w-md">
                <div className="mb-8 text-center">
                    <p className="soft-pill mx-auto">Account recovery</p>
                    <h1 className="mt-4 text-3xl font-black text-slate-950">Recover access</h1>
                    <p className="mt-2 text-sm text-slate-600">Enter the admin email for your clinic workspace.</p>
                </div>

                <div className="form-panel">
                    {state.message && <p className={state.ok ? "status-success" : "status-error"}>{state.message}</p>}
                    {!state.ok && (
                        <Form action={action} className="mt-4 grid gap-4">
                            <label className="grid gap-1.5">
                                <span className="field-label">Email address</span>
                                <input type="email" name="email" placeholder="admin@email.com" />
                            </label>
                            <button type="submit" className="btn-primary w-full" disabled={isPending}>
                                {isPending ? "Sending..." : "Send recovery link"}
                            </button>
                        </Form>
                    )}
                </div>
            </div>
        </main>
    );
}
