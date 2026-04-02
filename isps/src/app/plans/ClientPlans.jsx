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
        if (state.ok === true) {
            router.refresh();
        }
    }, [state]);

    return (
        <>
            {state.message && <p>{state.message}</p>}

            <button onClick={() => setMode("add")}>Add New Plan</button>
            <button onClick={() => setMode("update")}>Update Plan</button>
            <button onClick={() => setMode("delete")}>Delete Plan</button>

            {mode === "add" && (
                <Form action={action}>
                    <input type="number" name="speed" placeholder="0 Mbps" />
                    <input type="number" name="rate" placeholder="0 Rs" />
                    <button type="submit" disabled={isPending}>
                        {isPending ? "Adding..." : "Add"}
                    </button>
                </Form>
            )}

            {mode === "update" && (
                <Form action={action}>
                    <select name="public_id">
                        <option value="">select plan</option>
                        {plans.map((plan) => (
                            <option key={plan.public_id} value={plan.public_id}>
                                {plan.speed} Mbps - Rs {plan.rate}
                            </option>
                        ))}
                    </select>

                    <input type="number" name="speed" placeholder="speed" />
                    <input type="number" name="rate" placeholder="rate" />

                    <button type="submit" disabled={isPending}>
                        {isPending ? "Updating..." : "Update"}
                    </button>
                </Form>
            )}

            {mode === "delete" && (
                <Form action={action}>
                    <select name="public_id">
                        <option value="">select plan</option>
                        {plans.map((plan) => (
                            <option key={plan.public_id} value={plan.public_id}>
                                {plan.speed} Mbps - Rs {plan.rate}
                            </option>
                        ))}
                    </select>

                    <button type="submit" disabled={isPending}>
                        {isPending ? "Deleting..." : "Delete"}
                    </button>
                </Form>
            )}
        </>
    );
}