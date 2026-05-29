import { db } from "@/app/lib/turso";
import { fromHyphenSlug } from "@/app/utils/displaySlug";
import { getDayName, getMonthName } from "@/app/utils/getDateData";
import { minutesToMeridiem } from "@/app/utils/minutes-to-meridiem";
import { getUserPlus } from "@/app/lib/getUser";
import { redirect } from "next/navigation";
import EditSlotClient from "./Client";

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
    const doctorDisplayName = fromHyphenSlug(name);

    return (
        <main className="page-shell">
            <div className="mb-8">
                <p className="soft-pill">Generated slot</p>
                <h1 className="mt-4 text-3xl font-black text-slate-950">
                    {getDayName(day_number)} {getMonthName(month_number)} {date_number >= 10 ? date_number : '0' + date_number}, {year}
                </h1>
                <p className="mt-2 text-slate-600">Dr. {doctorDisplayName} - {fromHyphenSlug(department)} Department</p>
            </div>

            <EditSlotClient
                public_id={public_id}
                status={status}
                start_time={start_time}
                end_time={end_time}
                break_start={break_start}
                break_end={break_end}
                buffer_minutes={buffer_minutes}
                dummyHrs={dummyHrs}
                dummyMinutes={dummyMinutes}
                meridiem={meridiem}
                statusArr={statusArr}
                startValue={minutesToMeridiem(start_time, false)}
                endValue={minutesToMeridiem(end_time, false)}
                breakStartValue={minutesToMeridiem(break_start, false)}
                breakEndValue={minutesToMeridiem(break_end, false)}
            />
        </main>
    );
}
