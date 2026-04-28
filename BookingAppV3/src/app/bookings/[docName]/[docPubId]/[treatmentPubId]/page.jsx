import { rollingWindow } from "@/app/lib/rollingWindow";
import { db } from "@/app/lib/turso";
import { initBookingsTable } from "@/app/Models/initTables";
import { getDayName, getMonthName } from "@/app/utils/getDateData";
import ClientBookASlot from "./Client";

export default async function DoctorBookings({ params }) {


    const { docName, docPubId, treatmentPubId } = await params;
    const adminId = 1;

    const [fetchDoctor, fetchTreatment] = await Promise.all([
        db.execute(`SELECT * FROM doctors where admin_id = ? AND name = ? AND public_id = ?`, [adminId, docName.toLowerCase(), docPubId]),
        db.execute(`SELECT * FROM treatments where public_id = ? AND admin_id = ?`, [treatmentPubId, adminId])
    ]);

    if (fetchDoctor.rows.length === 0) return <p>Broken Link. Please try again.</p>;
    if (fetchTreatment.rows.length === 0) return <p>Broken Link. Please try again.</p>;

    const docId = fetchDoctor?.rows[0]?.id;
    const treatmentId = fetchTreatment?.rows[0]?.id;
    const treatmentDuration = fetchTreatment?.rows[0]?.duration;

    const [fetchRecord, fetchSlots, fetchBookings] = await Promise.all([
        db.execute(`SELECT * FROM doctor_treatments WHERE doctor_id = ? AND treatment_id = ? AND admin_id = ?`, [docId, treatmentId, adminId]),
        db.execute(`SELECT * FROM slots WHERE admin_id = ? AND doctor_id = ? AND full_date_at_period > DATE('now') ORDER BY full_date_at_period`, [adminId, docId]),
        db.execute(`SELECT * FROM bookings WHERE doctor_id = ?`, [docId])
    ]);

    if (fetchRecord.rows.length === 0) return <p>Broken Link. Please try again.</p>;
    if (fetchSlots.rows.length === 0) return <p>No slots available.</p>;

    const allVirtualSlots = fetchSlots.rows || [];

    for (const slot of allVirtualSlots) {
        slot.baseWindows = [
            { start: slot.start_time, end: slot.break_start },
            { start: slot.break_end, end: slot.end_time }
        ];
    }

    for (const fn1 of allVirtualSlots) {
        fn1.virtualSlots = [];
        for (const fn2 of fn1.baseWindows) {
            let newStart = fn2.start;
            while (newStart + treatmentDuration <= fn2.end) {
                fn1.virtualSlots.push({ start: newStart, end: newStart + treatmentDuration });
                newStart = newStart + treatmentDuration + fn1.buffer_minutes;
            }
        }
    };

    for (const fn1 of allVirtualSlots) {
        fn1.freeVirtualSlots = [];

        for (const fn2 of fn1.virtualSlots) {
            let isFree = true;

            for (const fn3 of fetchBookings.rows) {
                if (
                    fn1.date_number === fn3.date_number &&
                    fn1.month_number === fn3.month_number &&
                    fn1.year === fn3.year
                ) {
                    const overlap = fn3.treatment_start < fn2.end && fn3.treatment_end > fn2.start;
                    if (overlap) {
                        isFree = false;
                        break;
                    }
                }
            }
            if (isFree) {
                fn1.freeVirtualSlots.push(fn2);
            }
        }
    }




    //console.dir(allVirtualSlots, { depth: null });
    // console.dir(fetchBookings.rows, { depth: null });
    // console.log(fetchSlots.rows);
    // await initBookingsTable();
    // await rollingWindow();



    return (<>
        <div className="p-6">
            {allVirtualSlots.map((slot, index1) => (
                <div key={slot.public_id} className="border-2 ">
                    <p>{getDayName(slot.day_number)} {slot.date_number > 9 ? slot.date_number : `0${slot.date_number}`} {getMonthName(slot.month_number)} {slot.year}</p>
                    <p>Dr. {fetchDoctor.rows[0].name[0].toUpperCase() + fetchDoctor.rows[0].name.slice(1)} {JSON.parse(fetchDoctor.rows[0].qualifications).join(', ').toUpperCase()}</p>
                    <p>Slots for ( {fetchTreatment.rows[0].name.split("_").map(fn => fn[0].toUpperCase() + fn.slice(1)).join(" ")} )</p>
                    <p>Slot Duration: {fetchTreatment.rows[0].duration < 10 ? `0${fetchTreatment.rows[0].duration}` : fetchTreatment.rows[0].duration}min</p>
                    <details>
                        <summary>Available Slots</summary>
                        {slot.freeVirtualSlots.length > 0 ? slot.freeVirtualSlots.map((freeSlot, index2) => (
                            <div key={slot.public_id + index1 + index2} className="border-2">
                                <ClientBookASlot
                                    subSlot={freeSlot}
                                    docPubId={docPubId}
                                    day_number={slot.day_number}
                                    date_number={slot.date_number}
                                    month_number={slot.month_number}
                                    year={slot.year}
                                    treatmentPubId={treatmentPubId}
                                    treatment_start={freeSlot.start}
                                    treatment_end={freeSlot.end}
                                />
                            </div>
                        )) : <p>No available slots for this day.</p>}
                    </details>
                </div >
            ))
            }
        </div>
    </>);
}
