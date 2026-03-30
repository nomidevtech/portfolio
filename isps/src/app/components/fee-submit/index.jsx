'use client';

import { startTransition, useActionState, useRef, useState, useEffect } from "react";
import { fetchUserDetails, searchUserAction, submitAction } from "./feeSubmitSA";
import Form from "next/form";
import { updateRecords } from "@/app/lib/update-records";

export default function FeeSubmit() {

    return (
        <Form action={updateRecords}>
            <button type="submit">Submit</button>
        </Form>
    )


    const [stateSearch, formActionSearch, isPendingSearch] = useActionState(searchUserAction, {
        ok: null,
        searchComplete: false,
        arr: [],
        message: "",
    });

    const [stateDetails, formActionDetails, isPendingDetails] = useActionState(fetchUserDetails, {
        ok: null,
        fee_status: null,
    });

    const [stateSubmit, formActionSubmit, isPendingSubmit] = useActionState(submitAction, {
        ok: null,
        message: "",
    });

    const [view, setView] = useState("search");
    const searchTimeoutRef = useRef(null);


    const handleUserOnChange = (e) => {
        const value = e.target.value;
        if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
        searchTimeoutRef.current = setTimeout(() => {
            startTransition(() => {
                formActionSearch(value);
            });
        }, 500);
    };

    const handleReset = () => setView("search");

    if (view === "submit") {
        return (
            <div>
                <p>{stateSubmit.message}</p>
                <p>Status: {stateSubmit.fee_status}</p>
                <p>Invoice: {stateSubmit.invoiceId}</p>
                <p>Remaining: {stateSubmit.remaining_fee}</p>
                <button onClick={handleReset}>Start New Search</button>
            </div>
        );
    }

    if (view === "details") {
        if (!stateDetails.ok) {
            return (
                <div>
                    <p>{stateDetails.message}</p>
                    <button onClick={handleReset}>&larr; Back to Search</button>
                </div>
            );
        }

        return (
            <div>
                <h3>Payment Details for {stateDetails.username}</h3>

                {(stateDetails.fee_status === "paid" || stateDetails.fee_status === "partial") && (
                    <div>
                        <p>{stateDetails.message}</p>
                        {stateDetails.invoiceId && <p>Invoice ID: {stateDetails.invoiceId}</p>}
                        <button onClick={handleReset}>&larr; Back to Search</button>
                    </div>
                )}

                {stateDetails.fee_status === "unpaid" && (
                    <Form action={formActionSubmit}>
                        <input type="hidden" name="public_id" value={stateDetails.public_id} />
                        <input type="text" name="username" readOnly value={stateDetails.username || ""} />
                        <input type="text" name="contact" readOnly value={stateDetails.contact || ""} />
                        <input type="text" name="plan" readOnly value={stateDetails.plan || ""} />
                        <input type="number" name="fee_paid" defaultValue={stateDetails.rate || 0} />
                        {stateSubmit.ok === false && <p>{stateSubmit.message}</p>}
                        <button type="submit">
                            {isPendingSubmit ? "Submitting..." : "Submit Payment"}
                        </button>
                    </Form>
                )}
            </div>
        );
    }

    return (
        <div>
            <input
                type="text"
                placeholder="Search user..."
                onChange={handleUserOnChange}
            />

            {isPendingSearch && <p>Loading...</p>}

            {stateSearch.ok && stateSearch.arr.length > 0 && (
                <div>
                    {stateSearch.arr.map((user) => (
                        <div key={user.public_id}>
                            <Form
                                action={(formData) => {
                                    startTransition(() => {
                                        formActionDetails(formData);
                                        setView("details");
                                    });
                                }}
                            >
                                <input type="hidden" name="public_id" value={user.public_id} />
                                <input type="hidden" name="username" value={user.username} />
                                <button type="submit">
                                    {isPendingDetails ? "Fetching..." : user.username}
                                </button>
                            </Form>
                        </div>
                    ))}
                </div>
            )}

            {stateSearch.searchComplete && stateSearch.arr.length === 0 && (
                <p>No user found</p>
            )}
        </div>
    );
}