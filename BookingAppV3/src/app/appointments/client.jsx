"use client";

import { useState, useActionState } from "react";
import Form from "next/form";
import {
    adminRevokeBookings,
    adminRevokeBooking,
    doctorRevokeBookings,
    doctorRevokeBooking,
} from "./sa"; 

export function AdminRevokeBookings({ adminPubId, bookingDate }) {
    const [confirm, setConfirm] = useState(false);
    const [state, formAction, isPending] = useActionState(adminRevokeBookings, null);

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
        <Form action={formAction}>
            <input type="hidden" name="bookingsDate" value={bookingDate} />
            <input type="hidden" name="adminPubId" value={adminPubId} />

            <button type="submit" onClick={handleClick} disabled={isPending}>
                {isPending
                    ? "Revoking..."
                    : confirm
                        ? "Are you sure? Confirm Revoke ⛔"
                        : "Revoke All Bookings ⬅"}
            </button>

            {confirm && !isPending && (
                <>
                    <button onClick={handleCancel}>Cancel</button>
                    <p style={{ color: "red", marginTop: "8px" }}>
                        Warning: Affected patients will be notified and may need to reschedule or book again.
                    </p>
                </>
            )}

            {state && !state.ok && (
                <p style={{ color: "red", marginTop: "8px" }}>
                    Error: {state.message}
                </p>
            )}
        </Form>
    );
}

export function AdminRevokeBooking({ adminPubId, bookingPubId }) {
    const [confirm, setConfirm] = useState(false);
    const [state, formAction, isPending] = useActionState(adminRevokeBooking, null);

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
        <Form action={formAction}>
            <input type="hidden" name="bookingPubId" value={bookingPubId} />
            <input type="hidden" name="adminPubId" value={adminPubId} />

            <button type="submit" onClick={handleClick} disabled={isPending}>
                {isPending
                    ? "Revoking..."
                    : confirm
                        ? "Are you sure? Confirm Revoke ⛔"
                        : "Revoke This Booking ⬅"}
            </button>

            {confirm && !isPending && (
                <>
                    <button onClick={handleCancel}>Cancel</button>
                    <p style={{ color: "red", marginTop: "8px" }}>
                        Warning: Affected patients will be notified and may need to reschedule or book again.
                    </p>
                </>
            )}

            {state && !state.ok && (
                <p style={{ color: "red", marginTop: "8px" }}>
                    Error: {state.message}
                </p>
            )}
        </Form>
    );
}

export function DoctorRevokeBookings({ doctorPubId, bookingDate }) {
    const [confirm, setConfirm] = useState(false);
    const [state, formAction, isPending] = useActionState(doctorRevokeBookings, null);

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
        <Form action={formAction}>
            <input type="hidden" name="bookingsDate" value={bookingDate} />
            <input type="hidden" name="doctorPubId" value={doctorPubId} />

            <button type="submit" onClick={handleClick} disabled={isPending}>
                {isPending
                    ? "Revoking..."
                    : confirm
                        ? "Are you sure? Confirm Revoke ⛔"
                        : "Revoke All Bookings ⬅"}
            </button>

            {confirm && !isPending && (
                <>
                    <button onClick={handleCancel}>Cancel</button>
                    <p style={{ color: "red", marginTop: "8px" }}>
                        Warning: Affected patients will be notified and may need to reschedule or book again.
                    </p>
                </>
            )}

            {state && !state.ok && (
                <p style={{ color: "red", marginTop: "8px" }}>
                    Error: {state.message}
                </p>
            )}
        </Form>
    );
}

export function DoctorRevokeBooking({ doctorPubId, bookingPubId }) {
    const [confirm, setConfirm] = useState(false);
    const [state, formAction, isPending] = useActionState(doctorRevokeBooking, null);

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
        <Form action={formAction}>
            <input type="hidden" name="bookingPubId" value={bookingPubId} />
            <input type="hidden" name="doctorPubId" value={doctorPubId} />

            <button type="submit" onClick={handleClick} disabled={isPending}>
                {isPending
                    ? "Revoking..."
                    : confirm
                        ? "Are you sure? Confirm Revoke ⛔"
                        : "Revoke This Booking ⬅"}
            </button>

            {confirm && !isPending && (
                <>
                    <button onClick={handleCancel}>Cancel</button>
                    <p style={{ color: "red", marginTop: "8px" }}>
                        Warning: Affected patients will be notified and may need to reschedule or book again.
                    </p>
                </>
            )}

            {state && !state.ok && (
                <p style={{ color: "red", marginTop: "8px" }}>
                    Error: {state.message}
                </p>
            )}
        </Form>
    );
}