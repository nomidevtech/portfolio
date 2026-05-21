"use client";

import { useActionState } from "react";
import Form from "next/form";
import { capitalizeLabel } from "@/app/utils/displaySlug";
import { editSlotServerAction } from "./sa";

export default function EditSlotClient({
    public_id,
    status,
    start_time,
    end_time,
    break_start,
    break_end,
    buffer_minutes,
    dummyHrs,
    dummyMinutes,
    meridiem,
    statusArr,
    startValue,
    endValue,
    breakStartValue,
    breakEndValue,
}) {
    const [state, formAction, isPending] = useActionState(editSlotServerAction, null);

    return (
        <Form action={formAction} className="form-panel grid gap-5">
            <input type="hidden" name="slotPubId" value={public_id} />
            <label className="grid gap-1.5">
                <span className="field-label">Status</span>
                <select name="status" defaultValue={status}>
                    {statusArr.map((fn) => <option value={fn} key={fn}>{capitalizeLabel(fn)}</option>)}
                </select>
            </label>
            <TimeGroup title="Clinic start" prefix="start" hrs={dummyHrs} minutes={dummyMinutes} meridiem={meridiem} value={startValue} />
            <TimeGroup title="Clinic end" prefix="end" hrs={dummyHrs} minutes={dummyMinutes} meridiem={meridiem} value={endValue} />
            <TimeGroup title="Break start" prefix="breakStart" hrs={dummyHrs} minutes={dummyMinutes} meridiem={meridiem} value={breakStartValue} />
            <TimeGroup title="Break end" prefix="breakEnd" hrs={dummyHrs} minutes={dummyMinutes} meridiem={meridiem} value={breakEndValue} />
            <label className="grid gap-1.5">
                <span className="field-label">Buffer minutes</span>
                <input type="number" name="buffer" defaultValue={buffer_minutes} />
            </label>
            {state?.message && <p className="status-error">{state.message}</p>}
            <button type="submit" className="btn-primary w-full sm:w-auto" disabled={isPending}>
                {isPending ? "Updating..." : "Update slot"}
            </button>
        </Form>
    );
}

function TimeGroup({ title, prefix, hrs, minutes, meridiem, value }) {
    const hourName = `${prefix}Hr`;
    const minuteName = `${prefix}Min`;
    const meridiemName = `${prefix}Meridiem`;

    return (
        <fieldset className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4">
            <legend className="px-1 text-sm font-bold text-slate-700">{title}</legend>
            <div className="mt-3 grid grid-cols-3 gap-3">
                <select name={hourName} defaultValue={value.hrs}>{hrs.map((hr) => <option value={hr} key={hr}>{hr}</option>)}</select>
                <select name={minuteName} defaultValue={value.mins}>{minutes.map((min) => <option value={min} key={min}>{min}</option>)}</select>
                <select name={meridiemName} defaultValue={value.meridiem}>{meridiem.map((mer) => <option value={mer} key={mer}>{mer}</option>)}</select>
            </div>
        </fieldset>
    );
}
