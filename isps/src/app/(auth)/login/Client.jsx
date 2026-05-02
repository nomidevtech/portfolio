"use client";

import Form from "next/form";
import { loginSA } from "./loginSA";
import { useActionState } from "react";

export default function Client() {
    const initialState = { ok: null, message: "" };
    const [state, formAction, isPending] = useActionState(loginSA, initialState);

    return (
        <div>
            <div>
                <div>
                    <h1>Welcome back</h1>
                    <p>Sign in to your account</p>
                </div>

                <div>
                    <Form action="{formAction}">
                        <div>
                            <label>
                                Username
                            </label>
                            <input
                                name="username"
                                type="text"
                                placeholder="your_username"
                            />
                        </div>

                        <div>
                            <label>
                                Password
                            </label>
                            <input
                                name="password"
                                type="password"
                                placeholder="••••••••"
                            />
                        </div>

                        {state.message && (
                            <p>
                                {state.ok ? "Login successful! Redirecting…" : state.message}
                            </p>
                        )}

                        <button
                            type="submit"
                            disabled={isPending}
                        >
                            {isPending ? "Signing in…" : "Sign in"}
                        </button>
                    </Form>
                </div>

                <p>
                    Don't have an account?{" "}
                    <a href="/signup">
                        Sign up
                    </a>
                </p>
            </div>
        </div>
    );
}