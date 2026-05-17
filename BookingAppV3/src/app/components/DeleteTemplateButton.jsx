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
            <button className="btn-danger" onClick={() => setShowConfirm(true)} disabled={isPending}>
                Delete
            </button>
        );
    }

    return (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4">
            <p className="text-sm font-semibold text-rose-800">
                Deleting the <strong>{dayName}</strong> template permanently removes upcoming {dayName} slots for this doctor and notifies booked patients to reschedule.
            </p>
            <p className="mt-2 text-sm text-rose-800">Are you sure you want to delete this template?</p>
            <div className="mt-4 flex flex-wrap gap-2">
                <button className="btn-danger" disabled={isPending} onClick={handleDelete}>
                    {isPending ? "Deleting..." : "Yes, delete template"}
                </button>
                <button className="btn-secondary" onClick={() => setShowConfirm(false)} disabled={isPending}>
                    Cancel
                </button>
            </div>
        </div>
    );
}
