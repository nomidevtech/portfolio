'use client';

import { deleteAccount } from "@/app/lib/deleteAccount";
import Form from "next/form";
import { useActionState, useEffect, useState } from "react";

export default function DeleteClient() {
    const initialState = { ok: null, message: "" };
    const [state, formAction, isPending] = useActionState(deleteAccount, initialState);
    const [serverMessage, setServerMessage] = useState('');

    useEffect(() => {
        if (state.ok === false) setServerMessage(state.message);
    }, [state]);

    return (
        <div className="max-w-lg mx-auto px-4 py-8">
            <div className="mb-6">
                <h1 className="text-xl font-bold text-gray-900">Delete Account</h1>
                <p className="text-sm text-gray-500 mt-1">This action cannot be undone</p>
            </div>

            <div className="bg-red-50 border border-red-200 rounded-2xl p-5 mb-6">
                <div className="flex gap-3">
                    <span className="text-red-500 mt-0.5 shrink-0">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
                            <circle cx="12" cy="12" r="10" />
                            <line x1="12" y1="8" x2="12" y2="12" />
                            <line x1="12" y1="16" x2="12.01" y2="16" />
                        </svg>
                    </span>
                    <p className="text-sm text-red-700">
                        This action is irreversible. You will have to create a new account to continue using our services.
                    </p>
                </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <Form action={formAction} className="flex flex-col gap-4">
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                            Confirm Password
                        </label>
                        <input
                            type="password"
                            name="password"
                            placeholder="Enter your password to confirm"
                            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-400 bg-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                        />
                    </div>

                    {serverMessage && (
                        <p className="text-sm px-4 py-3 rounded-xl border text-red-600 bg-red-50 border-red-200">
                            {serverMessage}
                        </p>
                    )}

                    <button
                        type="submit"
                        disabled={isPending}
                        className="w-full bg-red-500 text-white rounded-xl py-3 text-sm font-semibold hover:bg-red-600 active:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                        {isPending ? "Deleting…" : "Delete Account"}
                    </button>
                </Form>
            </div>
        </div>
    );
}
