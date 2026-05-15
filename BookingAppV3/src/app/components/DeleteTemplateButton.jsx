"use client";

import { useTransition, useState } from "react";
import { deleteWeeklyTemplateWithCleanupSA } from "@/app/lib/deleteWeeklyTemplate";

export function DeleteTemplateButton({ templatePubId, docPubId, dayName }) {
    const [isPending, startTransition] = useTransition();
    const [showConfirm, setShowConfirm] = useState(false);

    const handleDelete = () => {
        startTransition(async () => {
            const formData = new FormData();
            formData.append("templatePubId", templatePubId);
            formData.append("docPubId", docPubId);
            await deleteWeeklyTemplateWithCleanupSA(formData);
        });
    };

    if (!showConfirm) {
        return (
            <button onClick={() => setShowConfirm(true)} disabled={isPending}>
                Delete
            </button>
        );
    }

    return (
        <div>
            <p>
                ⚠️ Deleting the <strong>{dayName}</strong> template will permanently remove all
                upcoming <strong>{dayName}</strong> slots for this doctor. If any patients have
                bookings on those slots, they will be automatically notified by email to reschedule.
            </p>
            <p>Are you sure you want to delete this template?</p>
            <button disabled={isPending} onClick={handleDelete}>
                {isPending ? "Deleting..." : "Yes, delete template"}
            </button>
            <button onClick={() => setShowConfirm(false)} disabled={isPending}>
                Cancel
            </button>
        </div>
    );
}