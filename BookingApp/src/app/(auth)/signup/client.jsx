'use client'
import Form from "next/form";
import { useActionState } from "react";
import { signupServerAction } from "./sa";

export default function ClientSignUp() {
    const [state, action, isPending] = useActionState(signupServerAction, { ok: false, message: null });

    return (
        <main className="page-shell">
            <div className="mx-auto max-w-3xl">
                <div className="mb-8">
                    <p className="soft-pill">Clinic onboarding</p>
                    <h1 className="mt-4 text-3xl font-black text-slate-950">Create a clinic account</h1>
                    <p className="mt-2 text-slate-600">Set up the admin login and clinic details used across booking pages.</p>
                </div>

                <Form action={action} className="form-panel grid gap-5">
                    {state.message && <p className={state.ok ? "status-success" : "status-error"}>{state.message}</p>}

                    <div className="grid gap-4 sm:grid-cols-2">
                        <label className="grid gap-1.5">
                            <span className="field-label">Full name</span>
                            <input type="text" name="full_name" placeholder="Full Name" />
                        </label>
                        <label className="grid gap-1.5">
                            <span className="field-label">Admin email</span>
                            <input type="email" name="admin_email" placeholder="admin@email.com" />
                        </label>
                        <label className="grid gap-1.5">
                            <span className="field-label">Username</span>
                            <input type="text" name="username" placeholder="Username" />
                        </label>
                        <label className="grid gap-1.5">
                            <span className="field-label">Clinic phone</span>
                            <input type="tel" name="clinic_phone" placeholder="+1 000 000 0000" />
                        </label>
                        <label className="grid gap-1.5">
                            <span className="field-label">Password</span>
                            <input type="password" name="password" placeholder="Password" />
                        </label>
                        <label className="grid gap-1.5">
                            <span className="field-label">Confirm password</span>
                            <input type="password" name="confirm_password" placeholder="Confirm Password" />
                        </label>
                    </div>

                    <label className="grid gap-1.5">
                        <span className="field-label">Clinic name</span>
                        <input type="text" name="clinic_name" placeholder="Clinic Name" />
                    </label>
                    <label className="grid gap-1.5">
                        <span className="field-label">Clinic address</span>
                        <input type="text" name="clinic_address" placeholder="Clinic Address" />
                    </label>

                    <button type="submit" className="btn-primary w-full sm:w-auto" disabled={isPending}>
                        {isPending ? "Submitting..." : "Create account"}
                    </button>
                </Form>
            </div>
        </main>
    );
}
