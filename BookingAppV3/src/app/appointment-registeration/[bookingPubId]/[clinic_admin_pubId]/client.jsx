'use client';

import Form from "next/form";
import { appointmentRegisterationServerAction } from "./sa";
import { useActionState } from "react";

export default function ClientAppointmentRegisteration({ bookingPubId, adminPubId }) {
    const [state, action, isPending] = useActionState(appointmentRegisterationServerAction, { ok: null, message: null });

    return (
        <Form action={action} className="form-panel stack-form">
            <input type="hidden" name="adminPubId" value={adminPubId} />
            <input type="hidden" name="bookingPubId" value={bookingPubId} />
            <label className="grid gap-1.5">
                <span className="field-label">Patient name</span>
                <input type="text" name="name" placeholder="Name" />
            </label>
            <label className="grid gap-1.5">
                <span className="field-label">Email</span>
                <input type="email" name="email" placeholder="example@ex.com" />
            </label>
            <label className="grid gap-1.5">
                <span className="field-label">Phone</span>
                <input type="text" name="phone" placeholder="Phone Number" />
            </label>
            {state.message && <p className={state.ok ? "status-success" : "status-error"}>{state.message}</p>}
            <button type="submit" className="btn-primary w-full" disabled={isPending}>
                {isPending ? "Registering..." : "Register appointment"}
            </button>
        </Form>
    );
}
