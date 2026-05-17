'use client';

import Form from "next/form";
import { reserveSlot } from "./sa";
import { minutesToMeridiem } from "@/app/utils/minutes-to-meridiem";
import { useActionState } from "react";

export default function ClientBookASlot({
    subSlot,
    adminPubId,
    docPubId,
    day_number,
    date_number,
    month_number,
    year,
    treatmentPubId,
    treatment_start,
    treatment_end
}) {
    const [state, action, isPending] = useActionState(reserveSlot, { ok: null, message: null });

    return (
        <div className="rounded-2xl border border-emerald-100 bg-white p-4">
            <p className="font-bold text-slate-950">{minutesToMeridiem(subSlot.start, true)} - {minutesToMeridiem(subSlot.end, true)}</p>
            {state.message && <p className={state.ok ? "status-success mt-3" : "status-error mt-3"}>{state.message}</p>}
            <Form action={action} className="mt-3">
                <input type="hidden" name="adminPubId" value={adminPubId} />
                <input type="hidden" name="docPubId" value={docPubId} />
                <input type="hidden" name="day_number" value={day_number} />
                <input type="hidden" name="date_number" value={date_number} />
                <input type="hidden" name="month_number" value={month_number} />
                <input type="hidden" name="year" value={year} />
                <input type="hidden" name="treatmentPubId" value={treatmentPubId} />
                <input type="hidden" name="treatment_start" value={treatment_start} />
                <input type="hidden" name="treatment_end" value={treatment_end} />
                <button type="submit" className="btn-primary w-full" disabled={isPending}>
                    {isPending ? "Loading..." : "Reserve slot"}
                </button>
            </Form>
        </div>
    );
}
