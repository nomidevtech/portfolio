"use client";

import { useState, useActionState } from "react";
import Form from "next/form";
import {
    adminRevokeBookings,
    adminRevokeBooking,
    doctorRevokeBookings,
    doctorRevokeBooking,
} from "./sa";

function RevokeForm({ action, hiddenFields, all = false }) {
    const [confirm, setConfirm] = useState(false);
    const [state, formAction, isPending] = useActionState(action, null);

    function handleClick(e) {
        if (!confirm) {
            e.preventDefault();
            setConfirm(true);
        }
    }

    function handleCancel(e) {
        e.preventDefault();
        setConfirm(false);
    }

    return (
        <Form action={formAction} className="mt-4">
            {hiddenFields.map((field) => (
                <input key={field.name} type="hidden" name={field.name} value={field.value} />
            ))}
            <div className="flex flex-wrap gap-2">
                <button type="submit" className={confirm ? "btn-danger" : "btn-secondary"} onClick={handleClick} disabled={isPending}>
                    {isPending ? "Revoking..." : confirm ? "Confirm revoke" : all ? "Revoke all bookings" : "Revoke booking"}
                </button>
                {confirm && !isPending && <button className="btn-secondary" onClick={handleCancel}>Cancel</button>}
            </div>

            {confirm && !isPending && (
                <p className="status-warning mt-3">
                    Affected patients will be notified and may need to reschedule or book again.
                </p>
            )}

            {state && !state.ok && <p className="status-error mt-3">Error: {state.message}</p>}
        </Form>
    );
}

export function AdminRevokeBookings({ adminPubId, bookingDate }) {
    return <RevokeForm action={adminRevokeBookings} all hiddenFields={[{ name: "bookingsDate", value: bookingDate }, { name: "adminPubId", value: adminPubId }]} />;
}

export function AdminRevokeBooking({ adminPubId, bookingPubId }) {
    return <RevokeForm action={adminRevokeBooking} hiddenFields={[{ name: "bookingPubId", value: bookingPubId }, { name: "adminPubId", value: adminPubId }]} />;
}

export function DoctorRevokeBookings({ doctorPubId, bookingDate }) {
    return <RevokeForm action={doctorRevokeBookings} all hiddenFields={[{ name: "bookingsDate", value: bookingDate }, { name: "doctorPubId", value: doctorPubId }]} />;
}

export function DoctorRevokeBooking({ doctorPubId, bookingPubId }) {
    return <RevokeForm action={doctorRevokeBooking} hiddenFields={[{ name: "bookingPubId", value: bookingPubId }, { name: "doctorPubId", value: doctorPubId }]} />;
}
