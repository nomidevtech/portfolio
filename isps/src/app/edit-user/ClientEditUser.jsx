'use client';

import Form from "next/form";
import { startTransition, useActionState, useEffect, useRef, useState } from "react";

import { fetchUserData, searchUser, updateUser } from "./edit-userSA";
import { checkUsernameServerAction } from "../lib/checkUsernameSA";

export default function ClientEditUser({ onReset }) {

    const [stateSearch, actionSearch, isPendingSearch] = useActionState(searchUser, { ok: null, searchComplete: false, arr: [], message: "" });
    const [stateDetails, actionDetails, isPendingDetails] = useActionState(fetchUserData, { ok: null, searchComplete: false, user: {}, message: "" });
    const [stateUsername, actionUsername] = useActionState(checkUsernameServerAction, { ok: null, message: "" });
    const [stateUpdate, actionUpdate, isPendingUpdate] = useActionState(updateUser, { ok: null, message: "" });

    const timerRef = useRef(null);
    const [view, setView] = useState("search");

    useEffect(() => {
        if (stateSearch.ok && stateSearch.arr.length > 0) setView("search");
        if (stateDetails.ok && stateDetails.user) setView("details");
        if (stateUpdate.ok && stateUpdate.searchComplete) setView("submited");
    }, [stateDetails, stateSearch, stateUpdate]);


    const handleOnChange = (e) => {
        const value = e.target.value;
        if (timerRef.current) clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => {
            startTransition(() => {
                actionSearch(value);
            });
        }, 1000);
    };



    return (<>
        {view === "search" && <Form action={actionSearch} onChange={handleOnChange}>
            <input type="text" name="username" placeholder="Search username" onChange={handleOnChange} />
        </Form>}

        {isPendingSearch && <span>Searching...</span>}
        {!stateSearch.ok && stateSearch.searchComplete && stateSearch.arr.length === 0 && (
            <p>{stateSearch.message}</p>
        )}

        {view === "search" && stateSearch.ok && stateSearch.arr.length > 0 && stateSearch.arr.map(user => (
            <Form key={user.public_id} action={actionDetails}>
                <input type="hidden" name="user_public_id" value={user.public_id} />
                <input type="hidden" name="username" value={user.username} />
                <button type="submit" disabled={isPendingDetails}>
                    {user.username}
                </button>
            </Form>
        ))}

        {view === "details" && stateDetails.ok && stateDetails.user && <>

            <Form action={actionUpdate}>
                {stateUsername.message && stateUsername.username !== stateDetails.user.username && <p>{stateUsername.message}</p>}
                <input type="text" name="new_username" defaultValue={stateDetails.user.username}
                    onBlur={(e) => {
                        const val = e.target.value.trim();
                        if (val) startTransition(() => actionUsername(val));
                    }}
                />
                <input type="number" name="contact" defaultValue={stateDetails.user.contact} placeholder="contact" />
                <input type="text" name="password" defaultValue={stateDetails.user.password} placeholder="password" />
                <input type="hidden" name="user_public_id" value={stateDetails.user.public_id} readOnly />
                <input type="hidden" name="username" value={stateDetails.user.username} readOnly />
                <button type="submit" disabled={isPendingDetails}>
                    {isPendingDetails ? "Updating..." : "Update"}
                </button>
                <button onClick={onReset}>Reset</button>
            </Form>
        </>}
        {view === "submited" && stateUpdate.ok && stateUpdate.message && <p>{stateUpdate.message}</p>}
        {!stateUpdate.ok && !stateUpdate.searchComplete && <p>{stateUpdate.message}</p>}
        {view === "submited" && stateUpdate.ok && stateUpdate.searchComplete && <button onClick={onReset}>New Search</button>}


    </>);
}