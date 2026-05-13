"use client";

import { useActionState } from "react";
import { addDoctorServerAction } from "./SA";

export default function ClientAddDoctor({ departments, treatments }) {
    const [state, formAction, isPending] = useActionState(addDoctorServerAction, null);

    return (
        <form action={formAction} className="flex flex-col gap-2">
            <input type="text" name="name" placeholder="Name" required />
            <input type="text" name="username" placeholder="Username" required />
            <input type="password" name="password" placeholder="Password" required />
            <input type="text" name="qualification" placeholder="Qualifications: MD, Surgeon" />

            <input list="departments" name="department" placeholder="Department" />
            <datalist id="departments">
                {departments.map((dep, idx) => <option key={idx} value={dep} />)}
            </datalist>

            <select name="treatmentPubId" required>
                <option value="">{treatments.length === 0 ? "Add Treament First" : "Select Treatment"}</option>
                {treatments.map((t, idx) => (
                    <option key={idx} value={t.treatmentPubId}>{t.string}</option>
                ))}
            </select>

            <button type="submit" disabled={isPending}>
                {isPending ? "Submitting..." : "Submit"}
            </button>

            {state?.message && (
                <p className={state.ok ? "text-green-500" : "text-red-500"}>
                    {state.message}
                </p>
            )}
        </form>
    );
}