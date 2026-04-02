'use client';

import Form from "next/form";
import { plansServerAction } from "./plansSA";
import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function ClientPlans({ plans = [] }) {
    const router = useRouter();
    const initialState = { ok: null, message: "" };
    const [state, action, isPending] = useActionState(plansServerAction, initialState);
    const [mode, setMode] = useState("");

    useEffect(() => {
        if (state.ok === true) router.refresh();
    }, [state]);

    const modeButtons = [
        { id: "add", label: "Add Plan" },
        { id: "update", label: "Update Plan" },
        { id: "delete", label: "Delete Plan" },
    ];

    return (
        <div className="max-w-lg mx-auto px-4 py-6">
            <div className="mb-6">
                <h1 className="text-xl font-bold text-gray-900">Manage Plans</h1>
                <p className="text-sm text-gray-500 mt-0.5">Create, update or remove ISP plans</p>
            </div>

            {/* Mode selector */}
            <div className="flex gap-2 mb-6">
                {modeButtons.map(({ id, label }) => (
                    <button
                        key={id}
                        onClick={() => setMode(mode === id ? "" : id)}
                        className={`flex-1 py-2.5 rounded-xl text-sm font-semibold border transition-colors ${
                            mode === id
                                ? id === "delete"
                                    ? "bg-red-500 text-white border-red-500"
                                    : "bg-gray-900 text-white border-gray-900"
                                : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
                        }`}
                    >
                        {label}
                    </button>
                ))}
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

            {/* ── Add Form ── */}
            {mode === "add" && (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-4">New Plan</p>
                    <Form action={action} className="flex flex-col gap-4">
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Speed (Mbps)</label>
                            <input
                                type="number"
                                name="speed"
                                placeholder="e.g. 10"
                                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-400 bg-white focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
                            />
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Rate (Rs)</label>
                            <input
                                type="number"
                                name="rate"
                                placeholder="e.g. 1500"
                                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-400 bg-white focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={isPending}
                            className="w-full bg-gray-900 text-white rounded-xl py-3 text-sm font-semibold hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                        >
                            {isPending ? "Adding…" : "Add Plan"}
                        </button>
                    </Form>
                </div>
            )}

            {/* ── Update Form ── */}
            {mode === "update" && (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-4">Update Plan</p>
                    <Form action={action} className="flex flex-col gap-4">
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Select Plan</label>
                            <select
                                name="public_id"
                                defaultValue=""
                                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
                            >
                                <option value="" disabled>Choose plan…</option>
                                {plans.map((plan) => (
                                    <option key={plan.public_id} value={plan.public_id}>
                                        {plan.speed} Mbps — Rs {plan.rate}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="flex gap-3">
                            <div className="flex flex-col gap-1.5 flex-1">
                                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">New Speed</label>
                                <input
                                    type="number"
                                    name="speed"
                                    placeholder="Mbps"
                                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-400 bg-white focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
                                />
                            </div>
                            <div className="flex flex-col gap-1.5 flex-1">
                                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">New Rate</label>
                                <input
                                    type="number"
                                    name="rate"
                                    placeholder="Rs"
                                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-400 bg-white focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
                                />
                            </div>
                        </div>
                        <button
                            type="submit"
                            disabled={isPending}
                            className="w-full bg-gray-900 text-white rounded-xl py-3 text-sm font-semibold hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                        >
                            {isPending ? "Updating…" : "Update Plan"}
                        </button>
                    </Form>
                </div>
            )}

            {/* ── Delete Form ── */}
            {mode === "delete" && (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-4">Delete Plan</p>
                    <Form action={action} className="flex flex-col gap-4">
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Select Plan</label>
                            <select
                                name="public_id"
                                defaultValue=""
                                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
                            >
                                <option value="" disabled>Choose plan to delete…</option>
                                {plans.map((plan) => (
                                    <option key={plan.public_id} value={plan.public_id}>
                                        {plan.speed} Mbps — Rs {plan.rate}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <button
                            type="submit"
                            disabled={isPending}
                            className="w-full bg-red-500 text-white rounded-xl py-3 text-sm font-semibold hover:bg-red-600 active:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                        >
                            {isPending ? "Deleting…" : "Delete Plan"}
                        </button>
                    </Form>
                </div>
            )}

            {/* ── Existing Plans List ── */}
            {plans.length > 0 && (
                <div className="mt-6">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3 px-1">Active Plans</p>
                    <div className="flex flex-col gap-2">
                        {plans.map((plan) => (
                            <div key={plan.public_id} className="bg-white rounded-xl border border-gray-100 shadow-sm px-4 py-3 flex items-center justify-between">
                                <span className="text-sm font-semibold text-gray-900">{plan.speed} Mbps</span>
                                <span className="text-sm text-gray-500">Rs {plan.rate}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
