'use client'
import { startTransition, useActionState, useEffect, useRef, useState } from "react";
import { fetchDetails, searchUser, submit } from "./feeSubmitSA";
import Form from "next/form";

export default function ChildFeeSubmit({ onReset }) {
    const properties = {
        record_public_id: null,
        fee_status: null,
        amount_due: null,
        remaining_fee: null,
        plan: null,
        contact: null,
        username: null,
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
            startTransition(() => {
                actionSearch(value);
            });
        }, 1000);
    };

    return (
        <>
            {view === "search" && (
                <div>
                    <input
                        type="text"
                        name="username"
                        placeholder=" search username"
                        onChange={handleOnChange}
                    />
                    {isPendingSearch && <span>Searching...</span>}
                    {!stateSearch.ok && stateSearch.searchComplete && stateSearch.arr.length === 0 && (
                        <p>{stateSearch.message}</p>
                    )}
                    {stateSearch.ok && stateSearch.arr.length > 0 && stateSearch.arr.map(user => (
                        <Form key={user.public_id} action={actionDetails}>
                            <input type="hidden" name="user_public_id" value={user.public_id} />
                            <input type="hidden" name="username" value={user.username} />
                            <button type="submit" disabled={isPendingDetails}>
                                {user.username}
                            </button>
                        </Form>
                    ))}
                </div>
            )}

            {!stateDetails.ok && stateDetails.searchComplete && <p>{stateDetails.message}</p>}

            {stateDetails.ok && stateDetails.record_public_id && view === "details" && (
                <Form action={actionSubmit}>
                    <input type="hidden" name="record_public_id" value={stateDetails.record_public_id} />
                    <input type="text" name="username" value={stateDetails.username || ""} readOnly />
                    <input type="text" name="plan" value={stateDetails.plan || ""} readOnly />
                    <input type="text" name="fee_status" value={stateDetails.fee_status || ""} readOnly />
                    <input type="number" name="amount_due" value={stateDetails.amount_due || 0} readOnly />
                    <input type="number" name="remaining_fee" value={stateDetails.remaining_fee || 0} readOnly />
                    <input type="text" name="contact" value={stateDetails.contact || ""} readOnly />
                    <input type="number" name="payment" placeholder="payment" defaultValue={stateDetails.remaining_fee || 0} />
                    <button type="submit" disabled={isPendingDetails}>
                        {isPendingDetails ? "Updating..." : "Update"}
                    </button>
                    <button type="button" onClick={onReset}>
                        Back to search
                    </button>
                </Form>
            )}

            {stateSubmit.ok && stateSubmit.submitComplete && view === "submited" && (
                <>
                    <p>{stateSubmit.message}</p>
                    <p>{stateSubmit.invoiceId}</p>
                    <button type="button" onClick={onReset}>
                        Back to search
                    </button>
                </>
            )}
            {!stateSubmit.ok && stateSubmit.submitComplete && view === "submited" && <p>{stateSubmit.message}</p>}
        </>
    );
}