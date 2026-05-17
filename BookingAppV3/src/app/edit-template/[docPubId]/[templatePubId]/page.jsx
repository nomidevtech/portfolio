import { db } from "@/app/lib/turso";
import { getDayName } from "@/app/utils/getDateData";
import { minutesToMeridiem } from "@/app/utils/minutes-to-meridiem";
import Form from "next/form";
import Link from "next/link";
import { updateWeeklyTemplateServerAction } from "./SA";
import { getUserPlus } from "@/app/lib/getUser";
import { redirect } from "next/navigation";
import { DeleteTemplateButton } from "@/app/components/DeleteTemplateButton";

export const metadata = {
    title: "Edit Template",
    description: "Edit weekly clinic hours, break time, and buffer minutes.",
};

export default async function EditDoctorTemplate({ params }) {
    const currentUser = await getUserPlus();
    if (!currentUser) return redirect("/login");
    if (!currentUser || currentUser.role !== "admin" || !currentUser.admin_id || currentUser.status !== "verified") redirect(`/verification/${currentUser?.admin_details?.public_id}`);
    const adminId = currentUser.admin_id;

    const { docPubId, templatePubId } = await params;

    const fetchDoctor = await db.execute(`SELECT * FROM doctors WHERE public_id = ? AND admin_id = ?`, [docPubId, adminId]);
    if (fetchDoctor.rows.length === 0) return <main className="page-shell"><p className="status-error">Broken link. Doctor not found.</p></main>

    const { name, id } = fetchDoctor.rows[0];
    const fetchTemplate = await db.execute(`SELECT * FROM weekly_templates WHERE public_id = ? AND doctor_id = ? AND admin_id = ?`, [templatePubId, id, adminId]);

    if (fetchTemplate.rows.length === 0) {
        return (
            <main className="page-shell-narrow">
                <p className="status-warning">No templates found.</p>
                <Link href={`/create-template/${docPubId}`} className="btn-primary mt-4">Create template</Link>
            </main>
        );
    }

    const template = fetchTemplate.rows[0];
    const dummyHrs = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0'));
    const dummyMinutes = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0'));
    const meridiem = ["AM", "PM"];
    const doctorName = name?.includes("-") ? name.split("-").map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(" ") : name[0].toUpperCase() + name.slice(1);

    return (
        <main className="page-shell">
            <div className="mb-8">
                <p className="soft-pill">Schedule templates</p>
                <h1 className="mt-4 text-3xl font-black text-slate-950">Dr. {doctorName}&apos;s {getDayName(template.day_number)} template</h1>
                <p className="mt-2 text-slate-600">Adjust the weekly clinic window and break settings.</p>
            </div>

            <div className="grid gap-6 lg:grid-cols-[1fr_22rem]">
                <Form action={updateWeeklyTemplateServerAction} className="form-panel grid gap-5">
                    <input type="hidden" name="doctorPublicId" value={docPubId} />
                    <input type="hidden" name="templatePublicId" value={templatePubId} />
                    <TimeGroup title="Clinic start" prefix="start" hrs={dummyHrs} minutes={dummyMinutes} meridiem={meridiem} value={minutesToMeridiem(template.start_time, false)} />
                    <TimeGroup title="Clinic end" prefix="end" hrs={dummyHrs} minutes={dummyMinutes} meridiem={meridiem} value={minutesToMeridiem(template.end_time, false)} />
                    <TimeGroup title="Break start" prefix="breakStart" hrs={dummyHrs} minutes={dummyMinutes} meridiem={meridiem} value={minutesToMeridiem(template.break_start, false)} />
                    <TimeGroup title="Break end" prefix="breakEnd" hrs={dummyHrs} minutes={dummyMinutes} meridiem={meridiem} value={minutesToMeridiem(template.break_end, false)} />
                    <label className="grid gap-1.5">
                        <span className="field-label">Buffer minutes</span>
                        <input type="number" name="buffer" defaultValue={template.buffer_minutes} />
                    </label>
                    <button type="submit" className="btn-primary w-full sm:w-auto">Update template</button>
                </Form>

                <aside className="section-panel h-fit">
                    <h2 className="text-lg font-black text-slate-950">Template actions</h2>
                    <p className="mt-2 text-sm text-slate-600">Deleting also removes future generated slots for this weekday.</p>
                    <div className="mt-4">
                        <DeleteTemplateButton templatePubId={template.public_id} docPubId={docPubId} dayName={getDayName(template.day_number)} />
                    </div>
                </aside>
            </div>
        </main>
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
