"use client";

import Form from "next/form";
import { loginSA } from "./loginSA";
import { useActionState } from "react";

export default function Client() {
    const initialState = { ok: null, message: "" };
    const [state, formAction, isPending] = useActionState(loginSA, initialState);

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
            <div className="w-full max-w-sm">
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-bold text-gray-900">Welcome back</h1>
                    <p className="text-sm text-gray-500 mt-1">Sign in to your account</p>
                </div>

                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                    <Form action={formAction} className="flex flex-col gap-4">
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                                Username
                            </label>
                            <input
                                name="username"
                                type="text"
                                placeholder="your_username"
                                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-400 bg-white focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
                            />
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                                Password
                            </label>
                            <input
                                name="password"
                                type="password"
                                placeholder="••••••••"
                                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-400 bg-white focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
                            />
                        </div>

                        {state.message && (
                            <p className={`text-sm px-4 py-3 rounded-xl border ${
                                state.ok
                                    ? "text-green-700 bg-green-50 border-green-200"
                                    : "text-red-600 bg-red-50 border-red-200"
                            }`}>
                                {state.ok ? "Login successful! Redirecting…" : state.message}
                            </p>
                        )}

                        <button
                            type="submit"
                            disabled={isPending}
                            className="w-full bg-gray-900 text-white rounded-xl py-3 text-sm font-semibold hover:bg-gray-700 active:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors mt-1"
                        >
                            {isPending ? "Signing in…" : "Sign in"}
                        </button>
                    </Form>
                </div>

                <p className="text-sm text-gray-500 text-center mt-6">
                    Don't have an account?{" "}
                    <a href="/signup" className="font-semibold text-gray-900 hover:underline">
                        Sign up
                    </a>
                </p>
            </div>
        </div>
    );
}
