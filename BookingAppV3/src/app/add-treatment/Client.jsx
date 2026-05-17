"use client";

import Form from "next/form";
import { useActionState } from "react";
import { addTreatmentServerAction } from "./SA";

export default function ClientAddTreatment({ treatments }) {
    const initialState = { ok: null, message: "" };
    const [state, formAction, isPending] = useActionState(addTreatmentServerAction, initialState);

    return (
        <main className="page-shell">
            <div className="mb-8">
                <p className="soft-pill">Treatment catalog</p>
                <h1 className="mt-4 text-3xl font-black text-slate-950">Add treatment</h1>
                <p className="mt-2 text-slate-600">Define services and durations before assigning them to doctors.</p>
            </div>

            <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
                <Form action={formAction} className="form-panel stack-form">
                    <label className="grid gap-1.5">
                        <span className="field-label">Treatment name</span>
                        <input type="text" name="name" placeholder="Consultation" />
                    </label>
                    <label className="grid gap-1.5">
                        <span className="field-label">Duration in minutes</span>
                        <input type="number" name="duration" placeholder="30" />
                    </label>
                    {state.message && <p className={state.ok ? "status-success" : "status-error"}>{state.message}</p>}
                    <button type="submit" className="btn-primary w-full" disabled={isPending}>
                        {isPending ? "Submitting..." : "Add treatment"}
                    </button>
                </Form>

                <section className="section-panel">
                    <h2 className="text-xl font-black text-slate-950">Current treatments</h2>
                    <div className="mt-5 grid gap-3">
                        {treatments?.length > 0 ? treatments.map((treatment, idx) => (
                            <div key={idx} className="flex items-center justify-between gap-4 rounded-2xl border border-emerald-100 bg-emerald-50 p-4">
                                <p className="font-semibold text-slate-900">{treatment.name}</p>
                                <span className="soft-pill">{Math.round(treatment.duration)} min</span>
                            </div>
                        )) : <p className="text-sm text-slate-600">No treatments added yet.</p>}
                    </div>
                </section>
            </div>
        </main>
    );
}
