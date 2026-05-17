import { db } from "@/app/lib/turso";
import { getDayName, getMonthName } from "@/app/utils/getDateData";
import { minutesToMeridiem } from "@/app/utils/minutes-to-meridiem";
import Form from "next/form";
import { editSlotServerAction } from "./sa";
import { getUserPlus } from "@/app/lib/getUser";
import { redirect } from "next/navigation";

export const metadata = {
    title: "Edit Slot",
    description: "Edit generated appointment slot settings.",
};

export default async function EditSlot({ params }) {
    const currentUser = await getUserPlus();
    if (!currentUser) return redirect("/login");
    if (!currentUser || currentUser.role !== "admin" || !currentUser.admin_id || currentUser.status !== "verified") redirect(`/verification/${currentUser?.admin_details?.public_id}`);
    const adminId = currentUser.admin_id;

    const { pubId } = await params;
    const fetchSlot = await db.execute(`SELECT * FROM slots WHERE public_id = ? AND admin_id = ?`, [pubId, adminId]);
    if (fetchSlot.rows.length === 0) return <main className="page-shell"><p className="status-error">Broken link. Slot not found.</p></main>

    const { public_id, doctor_id, status, day_number, month_number, year, date_number, start_time, end_time, break_start, break_end, buffer_minutes } = fetchSlot.rows[0];
    const fetchDoctor = await db.execute(`SELECT * FROM doctors WHERE id = ? AND admin_id = ?`, [doctor_id, adminId]);
    if (fetchDoctor.rows.length === 0) return <main className="page-shell"><p className="status-error">Broken link. Doctor not found.</p></main>

    const { name, department } = fetchDoctor.rows[0];
    const dummyHrs = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0'));
    const dummyMinutes = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0'));
    const meridiem = ["AM", "PM"];
    const statusArr = ["active", "inactive"];

    return (
        <main className="page-shell">
            <div className="mb-8">
                <p className="soft-pill">Generated slot</p>
                <h1 className="mt-4 text-3xl font-black text-slate-950">
                    {getDayName(day_number)} {getMonthName(month_number)} {date_number >= 10 ? date_number : '0' + date_number}, {year}
                </h1>
                <p className="mt-2 text-slate-600">Dr. {name[0].toUpperCase() + name.slice(1)} - {department} Department</p>
            </div>

            <Form action={editSlotServerAction} className="form-panel grid gap-5">
                <input type="hidden" name="slotPubId" value={public_id} />
                <label className="grid gap-1.5">
                    <span className="field-label">Status</span>
                    <select name="status" defaultValue={status}>
                        {statusArr.map((fn) => <option value={fn} key={fn}>{fn[0].toUpperCase() + fn.slice(1)}</option>)}
                    </select>
                </label>
                <TimeGroup title="Clinic start" prefix="start" hrs={dummyHrs} minutes={dummyMinutes} meridiem={meridiem} value={minutesToMeridiem(start_time, false)} />
                <TimeGroup title="Clinic end" prefix="end" hrs={dummyHrs} minutes={dummyMinutes} meridiem={meridiem} value={minutesToMeridiem(end_time, false)} />
                <TimeGroup title="Break start" prefix="breakStart" hrs={dummyHrs} minutes={dummyMinutes} meridiem={meridiem} value={minutesToMeridiem(break_start, false)} />
                <TimeGroup title="Break end" prefix="breakEnd" hrs={dummyHrs} minutes={dummyMinutes} meridiem={meridiem} value={minutesToMeridiem(break_end, false)} />
                <label className="grid gap-1.5">
                    <span className="field-label">Buffer minutes</span>
                    <input type="number" name="buffer" defaultValue={buffer_minutes} />
                </label>
                <button type="submit" className="btn-primary w-full sm:w-auto">Update slot</button>
            </Form>
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
