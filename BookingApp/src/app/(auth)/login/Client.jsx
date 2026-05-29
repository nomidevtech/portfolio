"use client";

import Form from "next/form";
import { loginSA } from "./loginSA";
import { useActionState } from "react";
import Link from "next/link";

export default function Client({ alreadyVerified = false }) {
    const initialState = { ok: null, message: "" };
    const [state, formAction, isPending] = useActionState(loginSA, initialState);

    return (
        <main className="page-shell-narrow">
            <div className="mx-auto w-full max-w-md">
                {alreadyVerified && (
                    <p className="status-success mb-6">Account already active — please log in.</p>
                )}
                <div className="mb-8 text-center">
                    <p className="soft-pill mx-auto">Clinic workspace</p>
                    <h1 className="mt-4 text-3xl font-black text-slate-950">Welcome back</h1>
                    <p className="mt-2 text-sm text-slate-600">Sign in to manage bookings and schedules.</p>
                </div>

                <div className="form-panel">
                    <Form action={formAction} className="stack-form">
                        <label className="grid gap-1.5">
                            <span className="field-label">Username</span>
                            <input name="username" type="text" placeholder="your_username" />
                        </label>

                        <label className="grid gap-1.5">
                            <span className="field-label">Password</span>
                            <input name="password" type="password" placeholder="Password" />
                        </label>

                        {state.message && (
                            <div className={state.ok ? "status-success" : "status-error"}>
                                <p>{state.ok ? "Login successful. Redirecting..." : state.message}</p>
                                {state.redirectUrl && (
                                    <Link href={state.redirectUrl} className="mt-2 block font-bold underline">
                                        Go to verification page →
                                    </Link>
                                )}
                            </div>
                        )}

                        <button type="submit" disabled={isPending} className="btn-primary w-full">
                            {isPending ? "Signing in..." : "Sign in"}
                        </button>
                    </Form>
                </div>

                <div className="mt-6 grid gap-3 text-center text-sm text-slate-600">
                    <p>
                        Don&apos;t have an account?{" "}
                        <Link href="/signup" className="font-semibold text-teal-800 hover:underline">
                            Sign up
                        </Link>
                    </p>
                    <p>
                        Forgot password?{" "}
                        <Link href="/recovery" className="font-semibold text-teal-800 hover:underline">
                            Recover access
                        </Link>
                    </p>
                </div>
            </div>
        </main>
    );
}
