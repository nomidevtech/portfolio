'use client';

import { startTransition, useActionState, useRef, useState } from "react";
import { fetchUserDetails, searchUserAction, submitAction } from "./feeSubmitSA";
import Form from "next/form";

export default function FeeSubmit() {

    const intialState = { ok: null, searchComplete: false, arr: [], message: "" };
    const intialState2 = { ok: null, searchComplete: false, obj: {}, message: "" };

    const [state, formAction, isPending] = useActionState(submitAction, { ok: null, message: "" });
    const [stateUsername, formActionUsername, isPendingUsername] = useActionState(searchUserAction, intialState);
    const [stateUserDetails, formActionUserDetails, isPendingUserDetails] = useActionState(fetchUserDetails, intialState2);

    const [selectedUser, setSelectedUser] = useState(null);

    const usernameRef = useRef(null);



    const hanldeUserOnChange = (e) => {
        const value = e.target.value;
        if (usernameRef.current) clearTimeout(usernameRef.current);

        usernameRef.current = setTimeout(() => {
            startTransition(() => {
                formActionUsername(value);
            });
        }, 500);
    };


    return (<>
        {/* ================ fetch Username ================ */}
        <input
            type="text"
            name="term"
            placeholder="search user"
            onChange={hanldeUserOnChange}
        />
        {isPendingUsername && "Loading..."}
        {stateUsername.ok && stateUsername.searchComplete && stateUsername.arr.length > 0 && <>
            {stateUsername.arr.map((user) => (
                <div key={user.public_id} >
                    <button
                        className="cursor-pointer"
                        onClick={() => setSelectedUser({
                            public_id: user.public_id,
                            username: user.username
                        })}
                    >
                        {user.username}
                    </button>
                </div>
            ))}
        </>}
        {stateUsername.ok && stateUsername.searchComplete && stateUsername.arr.length === 0 && <p>No user found</p>}
        {selectedUser && <>
            <p>Selected user: {selectedUser.username}
            </p>
            <button onClick={() => setSelectedUser(null)}>Clear User</button>
        </>}


        {/* ================ fetch User Details ================ */}
        {selectedUser &&
            <Form action={formActionUserDetails}>
                <input type="hidden" name="user_public_id" value={selectedUser.public_id} />
                <button type="submit" disabled={isPendingUserDetails} >{isPendingUserDetails ? "Fetching..." : "Fetch Details"}</button>
            </Form>
        }
        {!stateUserDetails.ok && stateUserDetails.searchComplete && <p> {stateUserDetails.message} make an entry down</p>}

        {stateUserDetails.ok && (() => {
            const obj = JSON.parse(stateUserDetails?.objSerialized);
            console.log('i am obj -----------------> ', obj);

            return (
                <>
                    <Form action={formAction}>
                        <input type="hidden" name="public_id" value={selectedUser.public_id} readOnly />
                        <input type="text" name="username" defaultValue={selectedUser.username} />

                        <input type="text" name="contact" readOnly value={obj.contact} />
                        <label >Phone Number</label>

                        <input type="number" name="rate" defaultValue={obj.rate} />
                        <label >Rs</label>

                        <input type="text" name="speed" readOnly value={obj.plan} />
                        <label >Mbps</label>
                        <button type="submit" disabled={isPending} >{isPending ? "Submitting..." : "Submit"}</button>
                    </Form>
                </>
            );
        })()}



    </>);;
}