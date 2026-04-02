'use client'

import { startTransition, useActionState } from "react"
import Form from "next/form"
import { signuptServerAction } from "./signupSA"
import { checkAdminNameServerAction } from "@/app/lib/checkAdminNameSA";

export default function SignUpClientComponent() {
    const initialState = { ok: null, message: "" };
    const [submitState, submitAction, submitPending] = useActionState(signuptServerAction, initialState);
    const [usernameState, usernameAction, usernamePending] = useActionState(checkAdminNameServerAction, null);

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
            <div className="w-full max-w-sm">
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-bold text-gray-900">Create account</h1>
                    <p className="text-sm text-gray-500 mt-1">Set up your admin account</p>
                </div>

                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                    <Form action={submitAction} className="flex flex-col gap-4">

                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                                Username
                            </label>
                            <input
                                name="username"
                                type="text"
                                placeholder="john_doe"
                                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-400 bg-white focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
                                onBlur={(e) => startTransition(() => usernameAction(e.target.value))}
                            />
                            {usernamePending && (
                                <p className="text-xs text-gray-400">Checking availability…</p>
                            )}
                            {usernameState?.message && (
                                <p className={`text-sm px-3 py-2 rounded-xl border ${
                                    usernameState.ok
                                        ? "text-green-700 bg-green-50 border-green-200"
                                        : "text-red-600 bg-red-50 border-red-200"
                                }`}>
                                    {usernameState.message}
                                </p>
                            )}
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

                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                                Confirm Password
                            </label>
                            <input
                                name="confirmPassword"
                                type="password"
                                placeholder="••••••••"
                                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-400 bg-white focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
                            />
                        </div>

                        {submitState?.message && (
                            <p className="text-sm px-4 py-3 rounded-xl border text-red-600 bg-red-50 border-red-200">
                                {submitState.message}
                            </p>
                        )}

                        <button
                            type="submit"
                            disabled={submitPending}
                            className="w-full bg-gray-900 text-white rounded-xl py-3 text-sm font-semibold hover:bg-gray-700 active:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors mt-1"
                        >
                            {submitPending ? "Creating account…" : "Create account"}
                        </button>
                    </Form>
                </div>

                <p className="text-sm text-gray-500 text-center mt-6">
                    Already have an account?{" "}
                    <a href="/login" className="font-semibold text-gray-900 hover:underline">
                        Sign in
                    </a>
                </p>
            </div>
        </div>
    )
}
