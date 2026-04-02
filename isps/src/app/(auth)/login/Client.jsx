"use client";

import Form from "next/form";
import { loginSA } from "./loginSA";
import { useActionState } from "react";

export default function Client() {

    const initialState = { ok: null, message: "" };

    const [state, formAction, isPending] = useActionState(loginSA, initialState);

    return (
        <div className="min-h-screen bg-zinc-950 flex items-center justify-center px-4">
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 w-full max-w-sm shadow-xl">

                <h1 className="text-white text-2xl font-semibold mb-1">Welcome back</h1>
                <p className="text-zinc-500 text-sm mb-6">Sign in to your account</p>

                <Form action={formAction} className="flex flex-col gap-4">

                    <div className="flex flex-col gap-1">
                        <label className="text-zinc-400 text-xs uppercase tracking-widest">
                            Username
                        </label>
                        <input
                            name="username"
                            type="text"
                            placeholder="you@example.com"
                            className="bg-zinc-800 text-white placeholder-zinc-600 border border-zinc-700 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 transition-colors"
                        />
                    </div>

                    <div className="flex flex-col gap-1">
                        <label className="text-zinc-400 text-xs uppercase tracking-widest">
                            Password
                        </label>
                        <input
                            name="password"
                            type="password"
                            placeholder="••••••••"
                            className="bg-zinc-800 text-white placeholder-zinc-600 border border-zinc-700 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 transition-colors"
                        />
                    </div>

                    {/* Message — red for error, green for success */}
                    {state && (
                        <p className={`text-sm px-3 py-2 rounded-lg border ${state.ok
                            ? "text-green-400 bg-green-950 border-green-800"
                            : "text-red-400 bg-red-950 border-red-800"
                            }`}>
                            {state.ok ? "Login successful! Redirecting…" : state.message}
                        </p>
                    )}

                    <button
                        type="submit"
                        disabled={isPending}
                        className="bg-white text-zinc-900 font-semibold rounded-lg py-2.5 text-sm hover:bg-zinc-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors mt-1"
                    >
                        {isPending ? "Signing in…" : "Sign in"}
                    </button>

                </Form>

                <p className="text-zinc-600 text-sm text-center mt-6">
                    Don't have an account?{" "}
                    <a href="/signup" className="text-zinc-300 hover:text-white transition-colors">
                        Sign up
                    </a>
                </p>

            </div>
        </div>
    );
}