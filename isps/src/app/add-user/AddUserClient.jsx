'use client';

import Form from "next/form";
import { startTransition, useActionState } from "react";
import { addUserServerAction } from "./addUserSA";
import { checkUsernameServerAction } from "../lib/checkUsernameSA";

export default function AddUserClient({ plans = [] }) {
    const initialState = { ok: null, username: null, message: "" };
    const [state, action, isPending] = useActionState(addUserServerAction, initialState);
    const [stateUsername, actionUsername] = useActionState(checkUsernameServerAction, initialState);

    return (
        <div className="max-w-lg mx-auto px-4 py-6">
            <div className="mb-6">
                <h1 className="text-xl font-bold text-gray-900">Add User</h1>
                <p className="text-sm text-gray-500 mt-0.5">Register a new ISP subscriber</p>
            </div>

            {state.message && (
                <p className={`text-sm px-4 py-3 rounded-xl border mb-4 ${
                    state.ok
                        ? "text-green-700 bg-green-50 border-green-200"
                        : "text-red-600 bg-red-50 border-red-200"
                }`}>
                    {state.message}
                </p>
            )}

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <Form action={action} className="flex flex-col gap-4">
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                            Username <span className="text-red-400">*</span>
                        </label>
                        <input
                            name="username"
                            type="text"
                            placeholder="e.g. john_doe"
                            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-400 bg-white focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
                            onBlur={(e) => {
                                const val = e.target.value.trim();
                                if (val) startTransition(() => actionUsername(val));
                            }}
                        />
                        {stateUsername.message && (
                            <p className={`text-xs px-3 py-2 rounded-lg border ${
                                stateUsername.ok
                                    ? "text-green-700 bg-green-50 border-green-200"
                                    : "text-red-600 bg-red-50 border-red-200"
                            }`}>
                                {stateUsername.message}
                            </p>
                        )}
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                            Password <span className="text-gray-400 font-normal normal-case">(optional)</span>
                        </label>
                        <input
                            type="password"
                            name="password"
                            placeholder="Leave blank to auto-generate"
                            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-400 bg-white focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
                        />
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                            Contact <span className="text-gray-400 font-normal normal-case">(optional)</span>
                        </label>
                        <input
                            type="number"
                            name="contact"
                            placeholder="Phone number"
                            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-400 bg-white focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
                        />
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                            Plan <span className="text-red-400">*</span>
                        </label>
                        <select
                            name="plan_public_id"
                            defaultValue=""
                            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
                        >
                            <option value="" disabled>Select a plan</option>
                            {plans.map((plan) => (
                                <option key={plan.public_id} value={plan.public_id}>
                                    {plan.speed} Mbps — Rs {plan.fee}
                                </option>
                            ))}
                        </select>
                    </div>

                    <button
                        type="submit"
                        disabled={isPending}
                        className="w-full bg-gray-900 text-white rounded-xl py-3 text-sm font-semibold hover:bg-gray-700 active:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors mt-1"
                    >
                        {isPending ? "Adding…" : "Add User"}
                    </button>
                </Form>
            </div>
        </div>
    );
}
