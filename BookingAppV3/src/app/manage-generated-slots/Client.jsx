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

    // Activate doesn't need confirmation
    if (!isActive) {
        return (
            <button disabled={isPending} onClick={handleToggle}>
                {isPending ? "Updating..." : "Activate"}
            </button>
        );
    }

    // Deactivate flow
    if (!showConfirm) {
        return (
            <button onClick={() => setShowConfirm(true)} disabled={isPending}>
                Deactivate
            </button>
        );
    }

    return (
        <div>
            {numberOfBookings > 0 && (
                <p>
                    ⚠️ There {numberOfBookings === 1 ? "is" : "are"}{" "}
                    <strong>{numberOfBookings}</strong>{" "}
                    {numberOfBookings === 1 ? "booking" : "bookings"} for this
                    day. Inactivating this slot will notify the affected{" "}
                    {numberOfBookings === 1 ? "patient" : "patients"} to
                    reschedule.
                </p>
            )}
            <p>Are you sure you want to deactivate this slot?</p>
            <button disabled={isPending} onClick={handleToggle}>
                {isPending ? "Updating..." : "Yes, deactivate"}
            </button>
            <button onClick={() => setShowConfirm(false)} disabled={isPending}>
                Cancel
            </button>
        </div>
    );
};












export function EditSlotButton({ slotPubId, numberOfBookings = 0 }) {
    const [showConfirm, setShowConfirm] = useState(false);
    const router = useRouter();

    const handleConfirm = () => {
        router.push(`/edit-slot/${slotPubId}`);
    };

    if (!showConfirm) {
        return (
            <button onClick={() => setShowConfirm(true)}>
                Edit
            </button>
        );
    }

    return (
        <div>
            <p>
                ⚠️ Editing this slot will permanently revoke all current bookings
                {numberOfBookings > 0 && (
                    <>
                        {" "}(<strong>{numberOfBookings}</strong> {numberOfBookings === 1 ? "booking" : "bookings"})
                    </>
                )}
                {" "}and notify {numberOfBookings === 1 ? "the affected patient" : "all affected patients"} to reschedule.
            </p>
            <p>Are you sure you want to proceed?</p>
            <button onClick={handleConfirm}>
                Yes, edit slot
            </button>
            <button onClick={() => setShowConfirm(false)}>
                Cancel
            </button>
        </div>
    );
}