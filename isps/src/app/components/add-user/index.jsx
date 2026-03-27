'use client';

import Form from "next/form";
import { startTransition, useActionState } from "react";
import { addUserServerAction } from "./addUserSA";
import { checkUsernameServerAction } from "./checkUsernameSA";

export default function AddUser() {
    const initialState = { ok: null, message: "" };


    const [state, action, isPending] = useActionState(addUserServerAction, initialState);
    const [stateUsername, actionUsername, isPendingUsername] = useActionState(checkUsernameServerAction, initialState);

    return (
        <>

            {state.message && <p>{state.message}</p>}
            {stateUsername.message && <p className="text-sm">{stateUsername.message}</p>}

            <Form action={action}>
                <input name="username" type="text" placeholder="add username"
                    onBlur={(e) => startTransition(() => actionUsername(e.target.value))}
                />
                <input type="password" name="password" placeholder="add password" />
                <input type="number" name="contact" placeholder="add contact" />

                <button type="submit" disabled={isPending}>
                    {isPending ? "Adding..." : "Add"}
                </button>
            </Form>
        </>
    );
}