'use client'

import { startTransition, useActionState } from "react"
import Form from "next/form"
import { signuptServerAction } from "./signupSA"
import { checkUsernameServerAction } from "@/app/lib/checkUsernameSA";

export default function SignUpClientComponent() {

    const initialState = { ok: null, message: "" };

    const [submitState, submitAction, submitPending] = useActionState(signuptServerAction, initialState);
    const [usernameState, usernameAction, usernamePending] = useActionState(checkUsernameServerAction, null);


    return (
        <div className="min-h-screen flex items-center justify-center bg-zinc-950 text-zinc-100">
            <div className="w-full max-w-sm bg-zinc-900 rounded-xl shadow-xl border border-zinc-800 p-8">
                <h1 className="text-xl font-semibold text-white mb-6">Create account</h1>

                {submitState?.message && (
                    <p className="mb-4 text-sm text-red-400 bg-red-900/20 border border-red-900/50 rounded-lg px-4 py-2">
                        {submitState.message}
                    </p>
                )}

                <Form action={submitAction} className="flex flex-col gap-4">


                    <input
                        name="username"
                        type="text"
                        placeholder="john_doe"
                        className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-500 outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        onBlur={(e) => startTransition(() => usernameAction(e.target.value))}
                    />
                    {usernamePending && (
                        <p className="text-sm text-zinc-500">Checking username availability...</p>
                    )}

                    {usernameState?.message && (
                        <p className={`text-sm rounded-lg px-4 py-2 ${usernameState.ok ? 'text-emerald-400 bg-emerald-900/20 border border-emerald-900/50' : 'text-red-400 bg-red-900/20 border border-red-900/50'}`}>
                            {usernameState.message}
                        </p>
                    )}

                    <input
                        name="password"
                        type="password"
                        placeholder="Password"
                        className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-500 outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                    <input
                        name="confirmPassword"
                        type="password"
                        placeholder="Confirm password"
                        className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-500 outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />

                    <button
                        type="submit"
                        disabled={submitPending}
                        className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg py-2 mt-2 transition-colors shadow-lg shadow-blue-900/20"
                    >
                        {submitPending ? 'Creating account...' : 'Sign up'}
                    </button>
                </Form>
            </div>
        </div>
    )
}