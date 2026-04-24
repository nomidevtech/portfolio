"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toggleSlotStatus } from "./sa";

export function ToggleSlotButton({ pubId, status }) {
    const [isPending, startTransition] = useTransition();
    const router = useRouter();

    const handleToggle = () => {
        startTransition(async () => {
            await toggleSlotStatus(pubId);
            router.refresh();
        });
    };

    return (
        <button
            disabled={isPending}
            onClick={handleToggle}
        >
            {isPending ? "Updating..." : status === "active" ? "Deactivate" : "Activate"}
        </button>
    );
}