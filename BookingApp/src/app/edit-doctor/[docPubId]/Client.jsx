"use client";

import { useActionState, useState } from "react";
import Form from "next/form";
import { fromHyphenSlug } from "@/app/utils/displaySlug";
import {
    addDoctorTreatment,
    deleteDoctor,
    editDoctorServerAction,
    removeDoctorTreatment
} from "./sa";

export default function ClientEditDoctor({
    docPubId,
    doctorData,
    departments,
    assignedTreatments,
    availableTreatments,
    qualifications
}) {
    const [editState, editAction] = useActionState(editDoctorServerAction, null);
    const [addState, addTreatmentAction] = useActionState(addDoctorTreatment, null);
    const [removeState, removeTreatmentAction] = useActionState(removeDoctorTreatment, null);
    const [deleteState, deleteAction] = useActionState(deleteDoctor, null);
    const [showConfirm, setShowConfirm] = useState(false);

    const doctorName = fromHyphenSlug(doctorData.doctor_name);
    const departmentDisplay = fromHyphenSlug(doctorData.department);

    return (
        <main className="page-shell">
            <div className="mb-8">
                <p className="soft-pill">Care team</p>
                <h1 className="mt-4 text-3xl font-black text-slate-950">Edit Dr. {doctorName}</h1>
                <p className="mt-2 text-slate-600">Update profile details and treatment assignments.</p>
            </div>

            <datalist id="departments">
                {departments?.map((dep, idx) => <option key={idx} value={dep} />)}
            </datalist>

            <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1.1fr)_minmax(22rem,0.9fr)]">
                <Form
                    action={editAction}
                    className="form-panel edit-doctor-form grid w-full gap-3.5"
                >
                    <input type="hidden" name="doctor_pubId" value={docPubId} />

                    <div className="grid gap-3 sm:grid-cols-2">
                        <Field label="Name">
                            <input type="text" name="name" placeholder="Name" defaultValue={doctorName} />
                        </Field>

                        <Field label="Username">
                            <input type="text" name="username" placeholder="Username" defaultValue={doctorData.doctor_username} />
                        </Field>

                        <Field label="New password">
                            <input type="password" name="new_password" placeholder="New password" />
                        </Field>

                        <Field label="Department">
                            <input list="departments" name="department" placeholder="Department" defaultValue={departmentDisplay} />
                        </Field>
                    </div>

                    <Field label="Qualifications">
                        <input type="text" name="qualification" placeholder="Qualifications" defaultValue={qualifications.join(", ")} />
                    </Field>

                    {editState?.message && (
                        <p className={editState.ok ? "status-success" : "status-error"}>
                            {editState.message}
                        </p>
                    )}

                    <button type="submit" className="btn-primary w-fit">Save doctor</button>
                </Form>

                <aside className="grid gap-5">
                    <section className="section-panel">
                        <h2 className="text-xl font-black text-slate-950">Current profile</h2>

                        <dl className="mt-4 divide-y divide-emerald-100 text-sm">
                            <Info label="Name" value={doctorName} />
                            <Info label="Department" value={departmentDisplay} />
                            <Info label="Qualifications" value={qualifications.join(", ").toUpperCase() || "None"} />
                            <Info
                                label="Treatments"
                                value={assignedTreatments?.length > 0 ? assignedTreatments.map(t => t.string).join(", ") : "None"}
                            />
                        </dl>
                    </section>

                    <section className="section-panel">
                        <h2 className="text-xl font-black text-slate-950">Treatment assignments</h2>

                        <Form action={addTreatmentAction} className="mt-4 grid gap-3">
                            <input type="hidden" name="doctor_pubId" value={docPubId} />

                            <select name="treatment">
                                <option>Select additional treatment</option>
                                {availableTreatments?.map((fn, idx) => (
                                    <option key={idx} value={fn.public_id}>{fn.string}</option>
                                ))}
                            </select>

                            {addState?.message && (
                                <p className={addState.ok ? "status-success" : "status-error"}>
                                    {addState.message}
                                </p>
                            )}

                            <button type="submit" className="btn-secondary">Add treatment</button>
                        </Form>

                        <Form action={removeTreatmentAction} className="mt-5 grid gap-3 border-t border-emerald-100 pt-5">
                            <input type="hidden" name="doctor_pubId" value={docPubId} />

                            <select name="remove_treatment">
                                <option>Select treatment to remove</option>
                                {assignedTreatments?.map((fn, idx) => (
                                    <option key={idx} value={fn.public_id}>{fn.string}</option>
                                ))}
                            </select>

                            {removeState?.message && (
                                <p className={removeState.ok ? "status-success" : "status-error"}>
                                    {removeState.message}
                                </p>
                            )}

                            <button type="submit" className="btn-secondary">Remove treatment</button>
                        </Form>
                    </section>

                    <div className="rounded-2xl border border-rose-200 bg-rose-50 p-5">
                        {deleteState?.message && (
                            <p className={deleteState.ok ? "status-success" : "status-error"}>
                                {deleteState.message}
                            </p>
                        )}

                        {!showConfirm ? (
                            <button type="button" className="btn-danger w-full" onClick={() => setShowConfirm(true)}>
                                Delete doctor
                            </button>
                        ) : (
                            <div>
                                <p className="text-sm font-semibold text-rose-800">
                                    Deleting this doctor permanently removes their templates, slots, and bookings. This cannot be undone.
                                </p>

                                <p className="mt-2 text-sm text-rose-800">Are you sure you want to delete this doctor?</p>

                                <div className="mt-4 flex flex-wrap gap-2">
                                    <Form action={deleteAction} className="inline">
                                        <input type="hidden" name="doctor_pubId" value={docPubId} />
                                        <button type="submit" className="btn-danger">Yes, delete</button>
                                    </Form>

                                    <button type="button" className="btn-secondary" onClick={() => setShowConfirm(false)}>
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </aside>
            </div>
        </main>
    );
}

function Field({ label, children }) {
    return (
        <label className="grid gap-1">
            <span className="field-label">{label}</span>
            {children}
        </label>
    );
}

function Info({ label, value }) {
    return (
        <div className="py-3 first:pt-0 last:pb-0">
            <dt className="field-label">{label}</dt>
            <dd className="mt-1 font-semibold text-slate-950">{value}</dd>
        </div>
    );
}