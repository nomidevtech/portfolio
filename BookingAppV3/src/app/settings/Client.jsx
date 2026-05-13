"use client";

import Form from "next/form";
import { useActionState } from "react";
import { updateAdmin, updateDoctor } from "./sa";

export default function ClientSettings(props) {
    const [adminState, adminFormAction, adminPending] = useActionState(updateAdmin, { ok: null, message: "" });
    const [doctorState, doctorFormAction, doctorPending] = useActionState(updateDoctor, { ok: null, message: "" });

    if (props.role === "admin") {
        return (
            <>
                <Form action={adminFormAction}>
                    <input type="hidden" name="adminPubId" value={props.adminPubId} />
                    <input type="text" name="name" placeholder="Name" defaultValue={props.admin_name} />
                    <input type="text" name="username" placeholder="username" defaultValue={props.admin_username} />
                    <input type="email" name="email" placeholder="example@ex.com" defaultValue={props.admin_email} />
                    <input type="text" name="clinic_name" placeholder="Clinic Name" defaultValue={props.clinic_name} />
                    <input type="tel" name="clinic_phone" placeholder="+1 000 000 0000" defaultValue={props.clinic_phone} />
                    <input type="text" name="clinic_address" placeholder="Street #00" defaultValue={props.clinic_address} />
                    <details>
                        <summary>Change Password</summary>
                        <input type="password" name="current_password" placeholder="Current Password" />
                        <input type="password" name="new_password" placeholder="New Password" />
                    </details>
                    {adminState.message && <p>{adminState.message}</p>}
                    <button type="submit" disabled={adminPending}>{adminPending ? "Saving..." : "Save Changes⬅"}</button>
                </Form>
            </>
        );
    }

    if (props.role === "doctor") {
        let qualifications = "";
        try { qualifications = JSON.parse(props.qualifications || "[]").join(', ').toUpperCase(); }
        catch (e) { qualifications = ""; }

        return (
            <>
                <Form action={doctorFormAction}>
                    <input type="hidden" name="docPublicId" value={props.docPublicId} />
                    <input type="text" name="name" placeholder="Name" defaultValue={props.name} />
                    <input type="text" name="username" placeholder="Username" defaultValue={props.username} />
                    <input type="text" name="qualifications" placeholder="Qualifications (e.g. MBBS, MD)" defaultValue={qualifications} />
                    <details>
                        <summary>Change Password</summary>
                        <input type="password" name="current_password" placeholder="Current Password" />
                        <input type="password" name="new_password" placeholder="New Password" />
                    </details>
                    {doctorState.message && <p>{doctorState.message}</p>}
                    <button type="submit" disabled={doctorPending}>{doctorPending ? "Updating..." : "Update⬅"}</button>
                </Form>
            </>
        );
    }

    return null;
}