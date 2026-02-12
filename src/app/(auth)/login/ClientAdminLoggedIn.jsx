'use client'

import { useActionState } from 'react';
import Form from 'next/form'; // Note: standard <form> works too if not using Next 15 features
import { changePassServerAction } from './changePassServerAction';

export default function ClientAdminLoggedIn({ username }) {
    // state will directly contain { ok, message } returned from the action
    const [state, formAction, isPending] = useActionState(changePassServerAction, null);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
            <section className="w-full max-w-md bg-white shadow-lg rounded-lg p-6 space-y-6">
                <h2 className="text-2xl font-semibold text-gray-800 text-center">
                    Change Password for {username}
                </h2>

                <Form action={formAction} className="space-y-4">
                    <div className="flex flex-col">
                        <label className="mb-1 text-gray-700 font-medium">Old Password</label>
                        <input
                            type="password"
                            name="oldPassword"
                            required
                            className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                        />
                    </div>

                    <div className="flex flex-col">
                        <label className="mb-1 text-gray-700 font-medium">New Password</label>
                        <input
                            type="password"
                            name="newPassword"
                            required
                            className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isPending}
                        className="w-full bg-blue-600 text-white font-medium py-2 rounded hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
                    >
                        {isPending ? 'Updating...' : 'Submit'}
                    </button>
                </Form>

                {/* Simplified Error/Success Display */}
                {state?.message && (
                    <p
                        className={`text-center font-medium p-2 rounded ${
                            state.ok ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50'
                        }`}
                    >
                        {state.message}
                    </p>
                )}
            </section>
        </div>
    );
}