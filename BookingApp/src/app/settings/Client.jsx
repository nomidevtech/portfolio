"use client";

import Form from "next/form";
import { useActionState, useState } from "react";
import { fromHyphenSlug } from "@/app/utils/displaySlug";
import { updateAdmin, updateDoctor } from "./sa";

function PasswordFields({ enabled }) {
    return (
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Field label="Current password">
                <input
                    type="password"
                    name="current_password"
                    placeholder="Current Password"
                    autoComplete="off"
                    disabled={!enabled}
                />
            </Field>
            <Field label="New password">
                <input
                    type="password"
                    name="new_password"
                    placeholder="New Password"
                    autoComplete="new-password"
                    disabled={!enabled}
                />
            </Field>
        </div>
    );
}

export default function ClientSettings(props) {
    const [adminState, adminFormAction, adminPending] = useActionState(updateAdmin, { ok: null, message: "" });
    const [doctorState, doctorFormAction, doctorPending] = useActionState(updateDoctor, { ok: null, message: "" });
    const [adminPasswordOpen, setAdminPasswordOpen] = useState(false);
    const [doctorPasswordOpen, setDoctorPasswordOpen] = useState(false);

    const name = fromHyphenSlug(props.admin_name);
    const clinicName = fromHyphenSlug(props.clinic_name);
    const clinicAddress = fromHyphenSlug(props.clinic_address);
    const doctorName = fromHyphenSlug(props.name);

    if (props.role === "admin") {
        return (
            <main className="page-shell">
                <div className="mb-8">
                    <p className="soft-pill">Account settings</p>
                    <h1 className="mt-4 text-3xl font-black text-slate-950">Clinic profile</h1>
                    <p className="mt-2 text-slate-600">Update admin credentials and public clinic details.</p>
                </div>

                <Form action={adminFormAction} className="form-panel grid gap-5">
                    <input type="hidden" name="adminPubId" value={props.adminPubId} />
                    <div className="grid gap-4 sm:grid-cols-2">
                        <Field label="Name"><input type="text" name="name" placeholder="Name" defaultValue={name} /></Field>
                        <Field label="Username"><input type="text" name="username" placeholder="username" defaultValue={props.admin_username} minLength={3} maxLength={20} /></Field>
                        <Field label="Email"><input type="email" name="email" placeholder="example@ex.com" defaultValue={props.admin_email} /></Field>
                        <Field label="Clinic name"><input type="text" name="clinic_name" placeholder="Clinic Name" defaultValue={clinicName} /></Field>
                        <Field label="Clinic phone"><input type="tel" name="clinic_phone" placeholder="+1 000 000 0000" defaultValue={props.clinic_phone} /></Field>
                        <Field label="Clinic address"><input type="text" name="clinic_address" placeholder="Street #00" defaultValue={clinicAddress} /></Field>
                    </div>

                    <details onToggle={(e) => setAdminPasswordOpen(e.currentTarget.open)}>
                        <summary>Change password</summary>
                        <PasswordFields enabled={adminPasswordOpen} />
                    </details>

                    {adminState.message && <p className={adminState.ok ? "status-success" : "status-error"}>{adminState.message}</p>}
                    <button type="submit" className="btn-primary w-full sm:w-auto" disabled={adminPending}>
                        {adminPending ? "Saving..." : "Save changes"}
                    </button>
                </Form>
            </main>
        );
    }

    if (props.role === "doctor") {
        let qualifications = "";
        try { qualifications = JSON.parse(props.qualifications || "[]").join(', ').toUpperCase(); }
        catch (e) { qualifications = ""; }

        return (
            <main className="page-shell">
                <div className="mb-8">
                    <p className="soft-pill">Account settings</p>
                    <h1 className="mt-4 text-3xl font-black text-slate-950">Doctor profile</h1>
                    <p className="mt-2 text-slate-600">Update your display profile and login credentials.</p>
                </div>

                <Form action={doctorFormAction} className="form-panel grid gap-5">
                    <input type="hidden" name="docPublicId" value={props.docPublicId} />
                    <div className="grid gap-4 sm:grid-cols-2">
                        <Field label="Name"><input type="text" name="name" placeholder="Name" defaultValue={doctorName} /></Field>
                        <Field label="Username"><input type="text" name="username" placeholder="Username" defaultValue={props.username} minLength={3} maxLength={20} /></Field>
                    </div>
                    <Field label="Qualifications"><input type="text" name="qualifications" placeholder="Qualifications (e.g. MBBS, MD)" defaultValue={qualifications} /></Field>

                    <details onToggle={(e) => setDoctorPasswordOpen(e.currentTarget.open)}>
                        <summary>Change password</summary>
                        <PasswordFields enabled={doctorPasswordOpen} />
                    </details>

                    {doctorState.message && <p className={doctorState.ok ? "status-success" : "status-error"}>{doctorState.message}</p>}
                    <button type="submit" className="btn-primary w-full sm:w-auto" disabled={doctorPending}>
                        {doctorPending ? "Updating..." : "Update profile"}
                    </button>
                </Form>
            </main>
        );
    }

    return null;
}

function Field({ label, children }) {
    return (
        <label className="grid gap-1.5">
            <span className="field-label">{label}</span>
            {children}
        </label>
    );
}
