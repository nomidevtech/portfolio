'use client'
import { startTransition, useActionState, useEffect, useRef, useState } from "react";
import { fetchDetails, searchUser, submit } from "./feeSubmitSA";
import Form from "next/form";

export default function ChildFeeSubmit({ onReset }) {
    const properties = {
        record_public_id: null, fee_status: null, amount_due: null,
        remaining_fee: null, plan: null, contact: null, username: null,
    };
    const initialState = { ok: null, searchComplete: false, arr: [], message: "" };
    const initialState2 = { ok: null, searchComplete: false, message: "", ...properties };

    const [stateSearch, actionSearch, isPendingSearch] = useActionState(searchUser, initialState);
    const [stateDetails, actionDetails, isPendingDetails] = useActionState(fetchDetails, initialState2);
    const [stateSubmit, actionSubmit, isPendingSubmit] = useActionState(submit, { ok: null, submitComplete: false, invoice: null, message: "" });

    const [view, setView] = useState("search");
    const timerRef = useRef(null);

    useEffect(() => {
        if (stateDetails.ok && stateDetails.record_public_id) setView("details");
        if (stateSubmit.ok && stateSubmit.submitComplete) setView("submited");
    }, [stateDetails, stateSubmit]);

    const handleOnChange = (e) => {
        const value = e.target.value;
        if (timerRef.current) clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => {
            startTransition(() => { actionSearch(value); });
        }, 1000);
    };

    return (
        <div className="max-w-lg mx-auto px-4 py-6">
            <div className="mb-6">
                <h1 className="text-xl font-bold text-gray-900">Collect Fees</h1>
                <p className="text-sm text-gray-500 mt-0.5">Search a user to process payment</p>
            </div>

            {/* ── Search View ── */}
            {view === "search" && (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                    <div className="flex flex-col gap-1.5 mb-4">
                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                            Username
                        </label>
                        <div className="relative">
                            <input
                                type="text"
                                name="username"
                                placeholder="Search username…"
                                onChange={handleOnChange}
                                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-400 bg-white focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
                            />
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
                        <div className="flex flex-col gap-2 mt-2">
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

            {!stateDetails.ok && stateDetails.searchComplete && (
                <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3 mt-4">
                    {stateDetails.message}
                </p>
            )}

            {/* ── Details / Payment View ── */}
            {stateDetails.ok && stateDetails.record_public_id && view === "details" && (
                <Form action={actionSubmit} className="flex flex-col gap-4">
                    <input type="hidden" name="record_public_id" value={stateDetails.record_public_id} />

                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-4">User Details</p>
                        <div className="grid grid-cols-2 gap-3">
                            {[
                                { label: "Username", value: stateDetails.username },
                                { label: "Plan", value: stateDetails.plan },
                                { label: "Contact", value: stateDetails.contact },
                                { label: "Status", value: stateDetails.fee_status },
                                { label: "Amount Due", value: stateDetails.amount_due ? `Rs ${stateDetails.amount_due}` : null },
                                { label: "Remaining", value: stateDetails.remaining_fee ? `Rs ${stateDetails.remaining_fee}` : null },
                            ].map(({ label, value }) => (
                                <div key={label}>
                                    <p className="text-xs text-gray-400 mb-0.5">{label}</p>
                                    <p className="text-sm font-semibold text-gray-900">{value || "—"}</p>
                                </div>
                            ))}
                        </div>

                        {/* hidden fields */}
                        <input type="hidden" name="username" value={stateDetails.username || ""} />
                        <input type="hidden" name="plan" value={stateDetails.plan || ""} />
                        <input type="hidden" name="fee_status" value={stateDetails.fee_status || ""} />
                        <input type="hidden" name="amount_due" value={stateDetails.amount_due || 0} />
                        <input type="hidden" name="remaining_fee" value={stateDetails.remaining_fee || 0} />
                        <input type="hidden" name="contact" value={stateDetails.contact || ""} />
                    </div>

                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                                Payment Amount (Rs)
                            </label>
                            <input
                                type="number"
                                name="payment"
                                placeholder="Enter amount"
                                defaultValue={stateDetails.remaining_fee || 0}
                                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-400 bg-white focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
                            />
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={onReset}
                            className="flex-1 border border-gray-200 text-gray-700 rounded-xl py-3 text-sm font-semibold hover:bg-gray-50 active:bg-gray-100 transition-colors"
                        >
                            Back
                        </button>
                        <button
                            type="submit"
                            disabled={isPendingSubmit}
                            className="flex-1 bg-gray-900 text-white rounded-xl py-3 text-sm font-semibold hover:bg-gray-700 active:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                        >
                            {isPendingSubmit ? "Processing…" : "Submit Payment"}
                        </button>
                    </div>
                </Form>
            )}

            {/* ── Success View ── */}
            {stateSubmit.ok && stateSubmit.submitComplete && view === "submited" && (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 text-center">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-6 h-6 text-green-600">
                            <polyline points="20 6 9 17 4 12" />
                        </svg>
                    </div>
                    <p className="text-base font-bold text-gray-900 mb-1">Payment Recorded</p>
                    <p className="text-sm text-gray-500 mb-1">{stateSubmit.message}</p>
                    {stateSubmit.invoiceId && (
                        <p className="text-xs text-gray-400 mb-6">Invoice: {stateSubmit.invoiceId}</p>
                    )}
                    <button
                        type="button"
                        onClick={onReset}
                        className="w-full bg-gray-900 text-white rounded-xl py-3 text-sm font-semibold hover:bg-gray-700 transition-colors"
                    >
                        New Payment
                    </button>
                </div>
            )}

            {!stateSubmit.ok && stateSubmit.submitComplete && view === "submited" && (
                <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3 mt-4">
                    {stateSubmit.message}
                </p>
            )}
        </div>
    );
}
