"use client";

import Form from "next/form";
import { useActionState } from "react";
import { addTreatmentServerAction } from "./SA";

export default function ClientAddTreatment({ treatments }) {
    const initialState = { ok: null, message: "" };
    const [state, formAction, isPending] = useActionState(addTreatmentServerAction, initialState);

    return (
        <>
            <Form action={formAction}>
                <input type="text" name="name" placeholder="Name" />
                <input type="number" name="duration" placeholder="Duration" />
                {state.message && <p>{state.message}</p>}
                <button type="submit" disabled={isPending}>{isPending ? "Submitting..." : "Submit"}</button>
            </Form>
            {treatments?.length > 0 && <>
                <h2>Current Treatments</h2>
                {treatments?.map((treatment, idx) => <p key={idx}>Type: {treatment.name} - Duration: {Math.round(treatment.duration)}min</p>)}
            </>}
        </>
    );
}