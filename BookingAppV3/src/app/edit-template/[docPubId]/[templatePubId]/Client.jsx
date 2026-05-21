"use client";

import { useActionState } from "react";
import Form from "next/form";
import { updateWeeklyTemplateServerAction } from "./SA";

export default function EditTemplateClient({
    docPubId,
    templatePubId,
    dummyHrs,
    dummyMinutes,
    meridiem,
    startValue,
    endValue,
    breakStartValue,
    breakEndValue,
    buffer_minutes,
}) {
    const [state, formAction, isPending] = useActionState(updateWeeklyTemplateServerAction, null);

    return (
        <Form action={formAction} className="form-panel grid gap-5">
            <input type="hidden" name="doctorPublicId" value={docPubId} />
            <input type="hidden" name="templatePublicId" value={templatePubId} />

            <div className="grid gap-4">
                <TimeGroup
                    title="Clinic start"
                    prefix="start"
                    hrs={dummyHrs}
                    minutes={dummyMinutes}
                    meridiem={meridiem}
                    value={startValue}
                />

                <TimeGroup
                    title="Clinic end"
                    prefix="end"
                    hrs={dummyHrs}
                    minutes={dummyMinutes}
                    meridiem={meridiem}
                    value={endValue}
                />

                <TimeGroup
                    title="Break start"
                    prefix="breakStart"
                    hrs={dummyHrs}
                    minutes={dummyMinutes}
                    meridiem={meridiem}
                    value={breakStartValue}
                />

                <TimeGroup
                    title="Break end"
                    prefix="breakEnd"
                    hrs={dummyHrs}
                    minutes={dummyMinutes}
                    meridiem={meridiem}
                    value={breakEndValue}
                />
            </div>

            <label className="grid gap-1.5">
                <span className="field-label">Buffer minutes</span>
                <input type="number" name="buffer" defaultValue={buffer_minutes} />
            </label>

            {state?.message && <p className="status-error">{state.message}</p>}

            <button type="submit" className="btn-primary w-full sm:w-auto" disabled={isPending}>
                {isPending ? "Updating..." : "Update template"}
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
            <p className="text-sm font-black text-slate-800">{title}</p>

            <div className="mt-3 grid gap-3 sm:grid-cols-3">
                <label className="grid gap-1.5">
                    <span className="field-label">Hour</span>
                    <select name={hourName} defaultValue={value.hrs}>
                        {hrs.map(hr => (
                            <option value={hr} key={hr}>
                                {hr}
                            </option>
                        ))}
                    </select>
                </label>

                <label className="grid gap-1.5">
                    <span className="field-label">Minute</span>
                    <select name={minuteName} defaultValue={value.mins}>
                        {minutes.map(min => (
                            <option value={min} key={min}>
                                {min}
                            </option>
                        ))}
                    </select>
                </label>

                <label className="grid gap-1.5">
                    <span className="field-label">AM / PM</span>
                    <select name={meridiemName} defaultValue={value.meridiem}>
                        {meridiem.map(mer => (
                            <option value={mer} key={mer}>
                                {mer}
                            </option>
                        ))}
                    </select>
                </label>
            </div>
        </fieldset>
    );
}