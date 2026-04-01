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
        <>
            {state.message && <p>{state.message}</p>}
            {stateUsername.message && <p>{stateUsername.message}</p>}

            <Form action={action}>
                <input
                    name="username"
                    type="text"
                    placeholder="add username"
                    onBlur={(e) => {
                        const val = e.target.value.trim();
                        if (val) startTransition(() => actionUsername(val));
                    }}
                />

                <input type="password" name="password" placeholder="add password (optional)" />
                <input type="number" name="contact" placeholder="add contact (optional)" />

                <select name="plan_public_id" defaultValue="">
                    <option value="" disabled>Select plan</option>
                    {plans.map((plan) => (
                        <option key={plan.public_id} value={plan.public_id}>
                            {plan.speed} Mbps {plan.fee} Rs
                        </option>
                    ))}
                </select>

                <button type="submit" disabled={isPending}>
                    {isPending ? "Adding..." : "Add"}
                </button>
            </Form>
        </>
    );
}