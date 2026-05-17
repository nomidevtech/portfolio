"use client";
import { useTransition, useState } from "react";
import { useRouter } from "next/navigation";
import { toggleSlotStatus } from "./sa";

export function ToggleSlotButton({ slotPubId, status, numberOfBookings = 0 }) {
    const [isPending, startTransition] = useTransition();
    const [showConfirm, setShowConfirm] = useState(false);
    const router = useRouter();
    const isActive = status === "active";

    const handleToggle = () => {
        startTransition(async () => {
            await toggleSlotStatus(slotPubId);
            router.refresh();
        });
        setShowConfirm(false);
    };

    if (!isActive) {
        return (
            <button className="btn-primary" disabled={isPending} onClick={handleToggle}>
                {isPending ? "Updating..." : "Activate"}
            </button>
        );
    }

    if (!showConfirm) {
        return (
            <button className="btn-secondary" onClick={() => setShowConfirm(true)} disabled={isPending}>
                Deactivate
            </button>
        );
    }

    return (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
            {numberOfBookings > 0 && (
                <p className="text-sm font-semibold text-amber-900">
                    There {numberOfBookings === 1 ? "is" : "are"} <strong>{numberOfBookings}</strong> {numberOfBookings === 1 ? "booking" : "bookings"} for this day. Inactivating this slot will notify affected patients to reschedule.
                </p>
            )}
            <p className="mt-2 text-sm text-amber-900">Are you sure you want to deactivate this slot?</p>
            <div className="mt-4 flex flex-wrap gap-2">
                <button className="btn-danger" disabled={isPending} onClick={handleToggle}>
                    {isPending ? "Updating..." : "Yes, deactivate"}
                </button>
                <button className="btn-secondary" onClick={() => setShowConfirm(false)} disabled={isPending}>
                    Cancel
                </button>
            </div>
        </div>
    );
}

export function EditSlotButton({ slotPubId, numberOfBookings = 0 }) {
    const [showConfirm, setShowConfirm] = useState(false);
    const router = useRouter();

    const handleConfirm = () => {
        router.push(`/edit-slot/${slotPubId}`);
    };

    if (!showConfirm) {
        return <button className="btn-secondary" onClick={() => setShowConfirm(true)}>Edit</button>;
    }

    return (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
            <p className="text-sm font-semibold text-amber-900">
                Editing this slot permanently revokes current bookings
                {numberOfBookings > 0 && <> (<strong>{numberOfBookings}</strong> {numberOfBookings === 1 ? "booking" : "bookings"})</>}
                {" "}and notifies affected patients to reschedule.
            </p>
            <p className="mt-2 text-sm text-amber-900">Are you sure you want to proceed?</p>
            <div className="mt-4 flex flex-wrap gap-2">
                <button className="btn-danger" onClick={handleConfirm}>Yes, edit slot</button>
                <button className="btn-secondary" onClick={() => setShowConfirm(false)}>Cancel</button>
            </div>
        </div>
    );
}
