"use client";

import Form from "next/form";
import { useActionState } from "react";
import { updateAdminPassword } from "./sa";

export default function ClientNewPassword({ adminPubId, recoveryToken }) {
    const initialState = { ok: null, message: "" };
    const [state, formAction, isPending] = useActionState(updateAdminPassword, initialState);

    return (
        <main className="page-shell-narrow">
            <div className="mx-auto max-w-md">
                <div className="mb-8 text-center">
                    <p className="soft-pill mx-auto">Secure update</p>
                    <h1 className="mt-4 text-3xl font-black text-slate-950">Set a new password</h1>
                    <p className="mt-2 text-sm text-slate-600">Choose a new password for your admin account.</p>
                </div>

                <Form action={formAction} className="form-panel stack-form">
                    <input type="hidden" name="adminPubId" value={adminPubId} />
                    <input type="hidden" name="recoveryToken" value={recoveryToken} />
                    <label className="grid gap-1.5">
                        <span className="field-label">New password</span>
                        <input type="password" name="password" placeholder="Enter new password" />
                    </label>
                    <label className="grid gap-1.5">
                        <span className="field-label">Confirm password</span>
                        <input type="password" name="confirm_password" placeholder="Confirm password" />
                    </label>
                    {state.message && <p className={state.ok ? "status-success" : "status-error"}>{state.message}</p>}
                    <button type="submit" className="btn-primary w-full" disabled={isPending}>
                        {isPending ? "Submitting..." : "Update password"}
                    </button>
                </Form>
            </div>
        </main>
    );
}
