'use client';

import Form from "next/form";
import { startTransition, useActionState, useEffect, useRef, useState } from "react";
import { fetchUserData, removeUser, searchUser, updateUser } from "./edit-userSA";
import { checkUsernameServerAction } from "../lib/checkUsernameSA";

export default function ClientEditUser({ onReset, plans = [] }) {
    const [stateSearch, actionSearch, isPendingSearch] = useActionState(searchUser, { ok: null, searchComplete: false, arr: [], message: "" });
    const [stateDetails, actionDetails, isPendingDetails] = useActionState(fetchUserData, { ok: null, searchComplete: false, user: {}, message: "" });
    const [stateUsername, actionUsername] = useActionState(checkUsernameServerAction, { ok: null, message: "" });
    const [stateUpdate, actionUpdate, isPendingUpdate] = useActionState(updateUser, { ok: null, message: "" });
    const [stateDelete, actionDelete, isPendingDelete] = useActionState(removeUser, { ok: null, message: "" });

    const timerRef = useRef(null);
    const [view, setView] = useState("search");

    useEffect(() => {
        if (stateSearch.ok && stateSearch.arr.length > 0) setView("search");
        if (stateDetails.ok && stateDetails.user) setView("details");
        if (stateUpdate.ok && stateUpdate.searchComplete) setView("submited");
        if (stateDelete.ok) setView("deleted");
    }, [stateDetails, stateSearch, stateUpdate, stateDelete]);

    const handleOnChange = (e) => {
        const value = e.target.value;
        if (timerRef.current) clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => {
            startTransition(() => { actionSearch(value); });
        }, 600);
    };

    return (
        <div className="max-w-lg mx-auto px-4 py-6">
            <div className="mb-6">
                <h1 className="text-xl font-bold text-gray-900">Edit User</h1>
                <p className="text-sm text-gray-500 mt-0.5">Search and update user details</p>
            </div>

            {/* ── Search View ── */}
            {view === "search" && (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                    <div className="flex flex-col gap-1.5 mb-4">
                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                            Username
                        </label>
                        <div className="relative">
                            <Form action={actionSearch} onChange={handleOnChange}>
                                <input
                                    type="text"
                                    name="username"
                                    placeholder="Search username…"
                                    onChange={handleOnChange}
                                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-400 bg-white focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
                                />
                            </Form>
                            {isPendingSearch && (
                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">
                                    Searching…
                                </span>
                            )}
                        </div>
                    </div>

                    {!stateSearch.ok && stateSearch.searchComplete && stateSearch.arr.length === 0 && (
                        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                            {stateSearch.message}
                        </p>
                    )}

                    {stateSearch.ok && stateSearch.arr.length > 0 && (
                        <div className="flex flex-col gap-2">
                            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Results</p>
                            {stateSearch.arr.map(user => (
                                <Form key={user.public_id} action={actionDetails}>
                                    <input type="hidden" name="user_public_id" value={user.public_id} />
                                    <input type="hidden" name="username" value={user.username} />
                                    <button
                                        type="submit"
                                        disabled={isPendingDetails}
                                        className="w-full text-left flex items-center justify-between border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium text-gray-900 hover:bg-gray-50 active:bg-gray-100 disabled:opacity-40 transition-colors"
                                    >
                                        <span>{user.username}</span>
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 text-gray-400">
                                            <polyline points="9 18 15 12 9 6" />
                                        </svg>
                                    </button>
                                </Form>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* ── Details / Edit View ── */}
            {view === "details" && stateDetails.ok && stateDetails.user && (
                <div className="flex flex-col gap-4">
                    <Form action={actionUpdate} className="flex flex-col gap-4">
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-4">Edit Details</p>

                            <div className="flex flex-col gap-4">
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Username</label>
                                    <input
                                        type="text"
                                        name="new_username"
                                        defaultValue={stateDetails.user.username}
                                        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
                                        onBlur={(e) => {
                                            const val = e.target.value.trim();
                                            if (val) startTransition(() => actionUsername(val));
                                        }}
                                    />
                                    {stateUsername.message && stateUsername.username !== stateDetails.user.username && (
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
                                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Plan</label>
                                    <div className="px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 text-sm text-gray-600">
                                        Current: {stateDetails.user.speed}Mbps — Rs {stateDetails.user.fee}
                                    </div>
                                    <input type="hidden" name="old_plan_public_id" value={stateDetails.user.plan_public_id} />
                                    <select
                                        name="new_plan_public_id"
                                        defaultValue=""
                                        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
                                    >
                                        <option value="" disabled>Change plan…</option>
                                        {plans.map((plan) => (
                                            <option key={plan.public_id} value={plan.public_id}>
                                                {plan.speed} Mbps — Rs {plan.rate}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="flex flex-col gap-1.5">
                                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Contact</label>
                                    <input
                                        type="number"
                                        name="contact"
                                        defaultValue={stateDetails.user.contact}
                                        placeholder="Contact number"
                                        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
                                    />
                                </div>

                                <div className="flex flex-col gap-1.5">
                                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Password</label>
                                    <input
                                        type="text"
                                        name="password"
                                        defaultValue={stateDetails.user.password}
                                        placeholder="Password"
                                        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
                                    />
                                </div>
                            </div>

                            <input type="hidden" name="user_public_id" value={stateDetails.user.public_id} />
                            <input type="hidden" name="username" value={stateDetails.user.username} />
                        </div>

                        <div className="flex gap-3">
                            <button
                                type="button"
                                onClick={onReset}
                                className="flex-1 border border-gray-200 text-gray-700 rounded-xl py-3 text-sm font-semibold hover:bg-gray-50 active:bg-gray-100 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isPendingUpdate}
                                className="flex-1 bg-gray-900 text-white rounded-xl py-3 text-sm font-semibold hover:bg-gray-700 active:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                            >
                                {isPendingUpdate ? "Saving…" : "Save Changes"}
                            </button>
                        </div>
                    </Form>

                    <Form action={actionDelete}>
                        <input type="hidden" name="user_public_id" value={stateDetails.user.public_id} />
                        <button
                            type="submit"
                            disabled={isPendingDelete}
                            className="w-full bg-red-50 text-red-600 border border-red-200 rounded-xl py-3 text-sm font-semibold hover:bg-red-100 active:bg-red-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                        >
                            {isPendingDelete ? "Deleting…" : "Delete User"}
                        </button>
                    </Form>
                </div>
            )}

            {/* ── Update messages ── */}
            {!stateUpdate.ok && !stateUpdate.searchComplete && stateUpdate.message && (
                <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3 mt-4">
                    {stateUpdate.message}
                </p>
            )}

            {/* ── Submitted View ── */}
            {view === "submited" && stateUpdate.ok && (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 text-center">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-6 h-6 text-green-600">
                            <polyline points="20 6 9 17 4 12" />
                        </svg>
                    </div>
                    <p className="text-base font-bold text-gray-900 mb-1">User Updated</p>
                    <p className="text-sm text-gray-500 mb-6">{stateUpdate.message}</p>
                    <button
                        onClick={onReset}
                        className="w-full bg-gray-900 text-white rounded-xl py-3 text-sm font-semibold hover:bg-gray-700 transition-colors"
                    >
                        New Search
                    </button>
                </div>
            )}

            {/* ── Deleted View ── */}
            {!stateDelete.ok && stateDelete.message && (
                <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3 mt-4">
                    {stateDelete.message}
                </p>
            )}
            {view === "deleted" && stateDelete.ok && (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 text-center">
                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6 text-gray-500">
                            <polyline points="3 6 5 6 21 6" />
                            <path d="M19 6l-1 14H6L5 6" />
                            <path d="M10 11v6M14 11v6" />
                            <path d="M9 6V4h6v2" />
                        </svg>
                    </div>
                    <p className="text-base font-bold text-gray-900 mb-1">User Deleted</p>
                    <p className="text-sm text-gray-500 mb-6">{stateDelete.message}</p>
                    <button
                        onClick={onReset}
                        className="w-full bg-gray-900 text-white rounded-xl py-3 text-sm font-semibold hover:bg-gray-700 transition-colors"
                    >
                        New Search
                    </button>
                </div>
            )}
        </div>
    );
}
