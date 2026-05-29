"use client";

import Form from "next/form";
import { useActionState, useTransition, useState } from "react";
import { addTreatmentServerAction, deleteTreatmentSA, editTreatmentSA } from "./SA";

function TreatmentCard({ treatment }) {
    // delete state
    const [showConfirm, setShowConfirm] = useState(false);
    const [deleteError, setDeleteError] = useState("");
    const [isPendingDelete, startDelete] = useTransition();

    // edit state
    const [isEditing, setIsEditing] = useState(false);
    const [editState, editAction, isPendingEdit] = useActionState(editTreatmentSA, { ok: null, message: "" });

    const handleDelete = () => {
        startDelete(async () => {
            const fd = new FormData();
            fd.append("publicId", treatment.publicId);
            const result = await deleteTreatmentSA(fd);
            if (result?.ok === false) {
                setDeleteError(result.message);
                setShowConfirm(false);
            }
        });
    };

    // edit mode
    if (isEditing) {
        return (
            <Form action={editAction} className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4 grid gap-3">
                <input type="hidden" name="publicId" value={treatment.publicId} />
                <div className="grid gap-1.5">
                    <span className="field-label">Treatment name</span>
                    <input type="text" name="name" defaultValue={treatment.name} required />
                </div>
                <div className="grid gap-1.5">
                    <span className="field-label">Duration (min)</span>
                    <input type="number" name="duration" defaultValue={treatment.duration} required />
                </div>
                {editState.message && (
                    <p className={editState.ok ? "status-success" : "status-error"}>{editState.message}</p>
                )}
                <div className="flex gap-2">
                    <button type="submit" className="btn-primary" disabled={isPendingEdit}>
                        {isPendingEdit ? "Saving..." : "Save"}
                    </button>
                    <button type="button" className="btn-secondary" onClick={() => setIsEditing(false)} disabled={isPendingEdit}>
                        Cancel
                    </button>
                </div>
            </Form>
        );
    }

    // delete confirm mode
    if (showConfirm) {
        return (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4">
                <p className="text-sm font-semibold text-rose-800">
                    Deleting <strong>{treatment.name}</strong> removes it from all doctor assignments. Existing bookings won't be deleted but will lose the treatment label.
                </p>
                <p className="mt-2 text-sm text-rose-800">Are you sure?</p>
                <div className="mt-4 flex flex-wrap gap-2">
                    <button className="btn-danger" disabled={isPendingDelete} onClick={handleDelete}>
                        {isPendingDelete ? "Deleting..." : "Yes, delete treatment"}
                    </button>
                    <button className="btn-secondary" onClick={() => setShowConfirm(false)} disabled={isPendingDelete}>
                        Cancel
                    </button>
                </div>
            </div>
        );
    }

    // default card
    return (
        <div className="flex items-center justify-between gap-4 rounded-2xl border border-emerald-100 bg-emerald-50 p-4">
            <div>
                <p className="font-semibold text-slate-900">{treatment.name}</p>
                {deleteError && <p className="mt-1 text-xs text-rose-700">{deleteError}</p>}
            </div>
            <div className="flex items-center gap-2 shrink-0">
                <span className="soft-pill">{Math.round(treatment.duration)} min</span>
                <button className="btn-ghost text-xs px-3" onClick={() => { setDeleteError(""); setIsEditing(true); }}>
                    Edit
                </button>
                <button className="btn-danger text-xs px-3" onClick={() => { setDeleteError(""); setShowConfirm(true); }}>
                    Delete
                </button>
            </div>
        </div>
    );
}


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
                        {treatments?.length > 0
                            ? treatments.map((t) => <TreatmentCard key={t.publicId} treatment={t} />)
                            : <p className="text-sm text-slate-600">No treatments added yet.</p>
                        }
                    </div>
                </section>
            </div>
        </main>
    );
}
