'use client';

import Form from "next/form";
import { reserveSlot } from "./sa";
import { minutesToMeridiem } from "@/app/utils/minutes-to-meridiem";
import { useActionState } from "react";

export default function ClientBookASlot(
    {
        subSlot,
        docPubId,
        day_number,
        date_number,
        month_number,
        year,
        treatmentPubId,
        treatment_start,
        treatment_end
    }
) {

    const [state, action, isPending] = useActionState(reserveSlot, { ok: null, message: null });

    return (<>
        {/* {state.message && <p>{state.message}</p>} */}
        <p>{minutesToMeridiem(subSlot.start, true)} - {minutesToMeridiem(subSlot.end, true)}</p>
        <Form action={action}>
            <input type="hidden" name="docPubId" value={docPubId} />
            <input type="hidden" name="day_number" value={day_number} />
            <input type="hidden" name="date_number" value={date_number} />
            <input type="hidden" name="month_number" value={month_number} />
            <input type="hidden" name="year" value={year} />
            <input type="hidden" name="treatmentPubId" value={treatmentPubId} />
            <input type="hidden" name="treatment_start" value={treatment_start} />
            <input type="hidden" name="treatment_end" value={treatment_end} />
            <button type="submit" className="btn btn-primary">Reserve Slot⬅</button>
        </Form>
    </>);
}
