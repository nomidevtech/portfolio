"use client";

import { useActionState } from "react";
import Form from "next/form";
import { addDoctorServerAction } from "./SA";

export default function ClientAddDoctor({ departments, treatments }) {
    const [state, formAction, isPending] = useActionState(addDoctorServerAction, null);

    return (
        <section>
            <div className="mb-8">
                <p className="soft-pill">Care team</p>
                <h1 className="mt-4 text-3xl font-black text-slate-950">Add doctor</h1>
                <p className="mt-2 text-slate-600">Create a doctor login and assign their first bookable treatment.</p>
            </div>

            <Form action={formAction} className="form-panel grid gap-5">
                <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Name"><input type="text" name="name" placeholder="Name" required /></Field>
                    <Field label="Username"><input type="text" name="username" placeholder="Username" required /></Field>
                    <Field label="Password"><input type="password" name="password" placeholder="Password" required /></Field>
                    <Field label="Department">
                        <input list="departments" name="department" placeholder="Department" />
                    </Field>
                </div>

                <datalist id="departments">
                    {departments.map((dep, idx) => <option key={idx} value={dep} />)}
                </datalist>

                <Field label="Qualifications">
                    <input type="text" name="qualification" placeholder="MD, Surgeon" />
                </Field>

                <Field label="Initial treatment">
                    <select name="treatmentPubId" required>
                        <option value="">{treatments.length === 0 ? "Add treatment first" : "Select treatment"}</option>
                        {treatments.map((t, idx) => (
                            <option key={idx} value={t.treatmentPubId}>{t.string}</option>
                        ))}
                    </select>
                </Field>

                {state?.message && <p className={state.ok ? "status-success" : "status-error"}>{state.message}</p>}

                <button type="submit" className="btn-primary w-full sm:w-auto" disabled={isPending}>
                    {isPending ? "Submitting..." : "Add doctor"}
                </button>
            </Form>
        </section>
    );
}

function Field({ label, children }) {
    return (
        <label className="grid gap-1.5">
            <span className="field-label">{label}</span>
            {children}
        </label>
    );
}
