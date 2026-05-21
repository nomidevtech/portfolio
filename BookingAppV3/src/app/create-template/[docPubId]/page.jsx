import Form from "next/form";
import { db } from "@/app/lib/turso";
import { fromHyphenSlug } from "@/app/utils/displaySlug";
import { createTemplateServerAction } from "./SA";
import { getDayName } from "@/app/utils/getDateData";
import { minutesToMeridiem } from "@/app/utils/minutes-to-meridiem";
import Link from "next/link";
import { getUserPlus } from "@/app/lib/getUser";
import { redirect } from "next/navigation";
import { DeleteTemplateButton } from "@/app/components/DeleteTemplateButton";

export const metadata = {
    title: "Create Doctor Template",
    description: "Create a weekly availability template for a doctor.",
};

export default async function DoctorCreateTemplate({ params }) {
    const currentUser = await getUserPlus();

    if (!currentUser) return redirect("/login");

    if (
        !currentUser ||
        currentUser.role !== "admin" ||
        !currentUser.admin_id ||
        currentUser.status !== "verified"
    ) {
        redirect(`/verification/${currentUser?.admin_details?.public_id}`);
    }

    const adminId = currentUser.admin_id;

    const { docPubId } = await params;

    const fetchDoctor = await db.execute(
        `SELECT * FROM doctors WHERE public_id = ? AND admin_id = ?`,
        [docPubId, adminId]
    );

    if (fetchDoctor.rows.length === 0) {
        return (
            <main className="page-shell">
                <p className="status-error">Broken link. Doctor not found.</p>
            </main>
        );
    }

    const { name, id } = fetchDoctor.rows[0];
    const doctorName = fromHyphenSlug(name);

    const fetchExisTemplates = await db.execute(
        `SELECT * FROM weekly_templates WHERE doctor_id = ? AND admin_id = ?`,
        [id, adminId]
    );

    let currentTemplates = fetchExisTemplates.rows.length > 0 ? fetchExisTemplates.rows : [];
    currentTemplates = currentTemplates?.sort((a, b) => a.day_number - b.day_number);

    const existDays = fetchExisTemplates.rows.map(fn => getDayName(fn.day_number));

    const allDays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const nonTemplateDays = allDays.filter(day => !existDays.includes(day));
    const days = nonTemplateDays.length === 0 ? allDays : nonTemplateDays;

    const dummyHrs = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, "0"));
    const dummyMinutes = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, "0"));
    const meridiem = ["AM", "PM"];

    return (
        <main className="page-shell">
            <div className="mb-8">
                <p className="soft-pill">Schedule templates</p>

                <h1 className="mt-4 text-3xl font-black text-slate-950">
                    Create template for Dr. {doctorName}
                </h1>

                <p className="mt-2 text-slate-600">
                    Department: {fromHyphenSlug(fetchDoctor.rows[0].department)}
                </p>
            </div>

            <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(24rem,0.95fr)]">
                <section className="section-panel">
                    <h2 className="text-xl font-black text-slate-950">Current templates</h2>

                    <div className="mt-5 grid gap-3">
                        {currentTemplates.length > 0 ? (
                            currentTemplates.map(temp => (
                                <div key={temp.public_id} className="data-card">
                                    <div className="flex flex-wrap items-start justify-between gap-3">
                                        <div>
                                            <p className="text-lg font-bold text-slate-950">
                                                {getDayName(temp.day_number)}
                                            </p>

                                            <p className="mt-1 text-sm text-slate-600">
                                                Clinic: {minutesToMeridiem(temp.start_time, true)} - {minutesToMeridiem(temp.end_time, true)}
                                            </p>

                                            <p className="text-sm text-slate-600">
                                                Break: {minutesToMeridiem(temp.break_start, true)} - {minutesToMeridiem(temp.break_end, true)}
                                            </p>

                                            <p className="text-sm text-slate-600">
                                                Buffer: {temp.buffer_minutes} minutes
                                            </p>
                                        </div>

                                        <Link
                                            href={`/edit-template/${docPubId}/${temp.public_id}`}
                                            className="btn-secondary"
                                        >
                                            Edit
                                        </Link>
                                    </div>

                                    <div className="mt-4">
                                        <DeleteTemplateButton
                                            templatePubId={temp.public_id}
                                            docPubId={docPubId}
                                            dayName={getDayName(temp.day_number)}
                                        />
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-sm text-slate-600">No weekly templates yet.</p>
                        )}
                    </div>
                </section>

                <Form action={createTemplateServerAction} className="form-panel grid gap-5">
                    <h2 className="text-xl font-black text-slate-950">New weekly template</h2>

                    <input type="hidden" name="doctorPublicId" value={docPubId} />

                    <div className="grid gap-4 sm:grid-cols-2">
                        <Field label="Day">
                            <select name="day">
                                {days.map(day => (
                                    <option value={day} key={day}>
                                        {day}
                                    </option>
                                ))}
                            </select>
                        </Field>

                        <Field label="Buffer in minutes">
                            <input type="number" name="buffer" defaultValue={10} />
                        </Field>
                    </div>

                    <div className="grid gap-4">
                        <TimeGroup
                            title="Clinic start"
                            prefix="start"
                            hrs={dummyHrs}
                            minutes={dummyMinutes}
                            meridiem={meridiem}
                            defaults={["09", "00", "AM"]}
                        />

                        <TimeGroup
                            title="Clinic end"
                            prefix="end"
                            hrs={dummyHrs}
                            minutes={dummyMinutes}
                            meridiem={meridiem}
                            defaults={["05", "00", "PM"]}
                        />

                        <TimeGroup
                            title="Break start"
                            prefix="breakStart"
                            hrs={dummyHrs}
                            minutes={dummyMinutes}
                            meridiem={meridiem}
                            defaults={["12", "00", "PM"]}
                        />

                        <TimeGroup
                            title="Break end"
                            prefix="breakEnd"
                            hrs={dummyHrs}
                            minutes={dummyMinutes}
                            meridiem={meridiem}
                            defaults={["01", "00", "PM"]}
                        />
                    </div>

                    <button type="submit" className="btn-primary w-full sm:w-auto">
                        Create template
                    </button>
                </Form>
            </div>
        </main>
    );
}

function Field({ label, children }) {
    return (
        <label className="grid gap-1.5">
            <span className="field-label">{label}</span>
            {children}
        </label>
    );
}

function TimeGroup({ title, prefix, hrs, minutes, meridiem, defaults }) {
    const hourName = `${prefix}Hr`;
    const minuteName = `${prefix}Min`;
    const meridiemName = `${prefix}Meridiem`;

    return (
        <fieldset className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4">
            <p className="text-sm font-black text-slate-800">{title}</p>

            <div className="mt-3 grid gap-3 sm:grid-cols-3">
                <label className="grid gap-1.5">
                    <span className="field-label">Hour</span>
                    <select name={hourName} defaultValue={defaults[0]}>
                        {hrs.map(hr => (
                            <option value={hr} key={hr}>
                                {hr}
                            </option>
                        ))}
                    </select>
                </label>

                <label className="grid gap-1.5">
                    <span className="field-label">Minute</span>
                    <select name={minuteName} defaultValue={defaults[1]}>
                        {minutes.map(min => (
                            <option value={min} key={min}>
                                {min}
                            </option>
                        ))}
                    </select>
                </label>

                <label className="grid gap-1.5">
                    <span className="field-label">AM / PM</span>
                    <select name={meridiemName} defaultValue={defaults[2]}>
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