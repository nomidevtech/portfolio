"use client";

import { useActionState } from "react";
import { addDoctorTreatment, deleteDoctor, editDoctorServerAction, removeDoctorTreatment } from "./sa";

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
    const doctorName = doctorData.doctor_name[0].toUpperCase() + doctorData.doctor_name.slice(1);

    return (
        <main className="page-shell">
            <div className="mb-8">
                <p className="soft-pill">Care team</p>
                <h1 className="mt-4 text-3xl font-black text-slate-950">Edit Dr. {doctorName}</h1>
                <p className="mt-2 text-slate-600">Update profile details and treatment assignments.</p>
            </div>

            <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
                <section className="form-panel grid gap-5">
                    {editState?.message && <p className={editState.ok ? "status-success" : "status-error"}>{editState.message}</p>}

                    <form action={editAction} className="grid gap-4">
                        <input type="hidden" name="doctor_pubId" value={docPubId} />
                        <div className="grid gap-4 sm:grid-cols-2">
                            <Field label="Name"><input type="text" name="name" placeholder="Name" defaultValue={doctorName} /></Field>
                            <Field label="Username"><input type="text" name="username" placeholder="username" defaultValue={doctorData.doctor_username} /></Field>
                            <Field label="New password"><input type="password" name="new_password" placeholder="New Password" /></Field>
                            <Field label="Department">
                                <input list="departments" name="department" placeholder="Department" defaultValue={doctorData.department[0].toUpperCase() + doctorData.department.slice(1)} />
                            </Field>
                        </div>
                        <datalist id="departments">
                            {departments?.map((dep, idx) => <option key={idx} value={dep} />)}
                        </datalist>
                        <Field label="Qualifications">
                            <input type="text" name="qualification" placeholder="Qualifications" defaultValue={qualifications.join(", ")} />
                        </Field>
                        <button type="submit" className="btn-primary w-full sm:w-auto">Save doctor</button>
                    </form>
                </section>

                <aside className="grid gap-6">
                    <section className="section-panel">
                        <h2 className="text-xl font-black text-slate-950">Current profile</h2>
                        <dl className="mt-4 grid gap-3 text-sm">
                            <Info label="Name" value={doctorName} />
                            <Info label="Department" value={doctorData.department[0].toUpperCase() + doctorData.department.slice(1)} />
                            <Info label="Qualifications" value={qualifications.join(", ").toUpperCase() || "None"} />
                            <Info label="Treatments" value={assignedTreatments?.length > 0 ? assignedTreatments.map(t => t.string).join(", ") : "None"} />
                        </dl>
                    </section>

                    <section className="section-panel">
                        <h2 className="text-lg font-black text-slate-950">Treatment assignments</h2>
                        <form action={addTreatmentAction} className="mt-4 grid gap-3">
                            <input type="hidden" name="doctor_pubId" value={docPubId} />
                            <select name="treatment">
                                <option>Select additional treatment</option>
                                {availableTreatments?.map((fn, idx) => <option key={idx} value={fn.public_id}>{fn.string}</option>)}
                            </select>
                            {addState?.message && <p className={addState.ok ? "status-success" : "status-error"}>{addState.message}</p>}
                            <button type="submit" className="btn-secondary">Add treatment</button>
                        </form>

                        <form action={removeTreatmentAction} className="mt-5 grid gap-3 border-t border-emerald-100 pt-5">
                            <input type="hidden" name="doctor_pubId" value={docPubId} />
                            <select name="remove_treatment">
                                <option>Select treatment to remove</option>
                                {assignedTreatments?.map((fn, idx) => <option key={idx} value={fn.public_id}>{fn.string}</option>)}
                            </select>
                            {removeState?.message && <p className={removeState.ok ? "status-success" : "status-error"}>{removeState.message}</p>}
                            <button type="submit" className="btn-secondary">Remove treatment</button>
                        </form>
                    </section>

                    <form action={deleteAction} className="rounded-2xl border border-rose-200 bg-rose-50 p-5">
                        <input type="hidden" name="doctor_pubId" value={docPubId} />
                        {deleteState?.message && <p className={deleteState.ok ? "status-success" : "status-error"}>{deleteState.message}</p>}
                        <button type="submit" className="btn-danger w-full">Delete doctor</button>
                    </form>
                </aside>
            </div>
        </main>
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

function Info({ label, value }) {
    return (
        <div className="rounded-2xl bg-emerald-50 p-4">
            <dt className="font-bold text-slate-500">{label}</dt>
            <dd className="mt-1 font-semibold text-slate-950">{value}</dd>
        </div>
    );
}
