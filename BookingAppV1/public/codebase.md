## src\app\layout.tsx

```
import Link from "next/link";
import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dentist Booking App",
  description: "Book your dental appointment online â€” choose a day, pick a time slot, and confirm your visit.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode; }>) {
  return (
    <html lang="en">
      <body className="min-h-full flex flex-col mb-80">
        <Link href="/">Home</Link>
        {children}
      </body>
    </html>
  );
}

```

---

## src\app\page.tsx

```
import Link from "next/link";
import { initBookingsTable, initDoctorsTable, initWeeklyTemplateTable } from "./models/initiTables";

export default async function Home() {

  await initBookingsTable();
  await initDoctorsTable();
  await initWeeklyTemplateTable();

  return (<>
    <Link href="/manage-weekly-template">Manage Weekly Template</Link>
    <Link href="/booking">Booking</Link>
    <Link href="/add-doctor">Add Doctor</Link>
    <Link href="/appointments">Appointments</Link>

  </>);
}

```

---

## src\app\add-doctor\page.jsx

```
import Form from "next/form";
import { addDoctorServerAction } from "./SA";
import { db } from "../lib/turso";

export default async function AddDoctor() {

  const fetchDepartments = await db.execute("SELECT department FROM doctors");
  const departmentsArr = fetchDepartments?.rows?.map(r => r.department);
  const departments = [...new Set(departmentsArr)] ;

  return (<>
    <Form action={addDoctorServerAction}>
      <input type="text" name="name" placeholder="name" />
      <input type="text" name="title" placeholder="title" />
      < input list="departments" name="department" placeholder="department" />
      <datalist id="departments">
        {departments.map(department => <option key={department} value={department} />)}
      </datalist>
      <button type="submit">Submit</button>
    </Form>
  </>);
}
```

---

## src\app\add-doctor\SA.js

```
"use server";

import { nanoid } from "nanoid";
import { redirect } from "next/navigation";
import { db } from "../lib/turso";


export async function addDoctorServerAction(formData) {

    const name = formData.get("name");
    const department = formData.get("department");
    const title = formData.get("title");
    const publicId = nanoid(12);

    try {
        await db.execute(
            "INSERT INTO doctors (public_id, name, department, title) VALUES (?, ?, ?, ?)",
            [publicId, name, department, title]
        );
    } catch (error) {
        console.error(error);
        return { ok: false, message: error.message }
    }
    redirect(`/create-weekly-template/${publicId}`);
}
```

---

## src\app\appointments\Client.jsx

```
'use client'

import { useState, useActionState, cache } from "react";
import { cancelBookingServerAction, cancelManyBookingsServerAction, fetchAllBookings } from "./SA";
import { minutesToMeridiem } from "../utils/minutes-to-meridiem";

export default function ClientAppointments({ dateKeysFromParent = [], docArrFromParent = [] }) {

    const [dateKeys, setDateKeys] = useState(dateKeysFromParent);
    const [docArr, setDocArr] = useState(docArrFromParent);

    const [fullCache, setFullCache] = useState(null);

    const d = new Date();

    async function handleAllBookings() {

        if (fullCache) {
            setDateKeys(fullCache.dateKeys);
            setDocArr(fullCache.docArrSafe);
            return;
        }

        const res = await fetchAllBookings(d, "allall");
        setFullCache(res);
        setDateKeys(res.dateKeys);
        setDocArr(res.docArrSafe);
    };



    return (<>
        {dateKeys.length === 0 && <button onClick={handleAllBookings}>Show All Appointments â¬…</button>}
        {fullCache && <button onClick={() => {
            setDateKeys(dateKeysFromParent);
            setDocArr(docArrFromParent);
        }}>Show Verified Appointments â¬…</button>}
        {
            dateKeys.map(dateKey => (
                <div key={dateKey} className="border-2 m-4  border-red-500">
                    <DateSegment dateKey={dateKey} docArr={docArr} />
                </div>
            ))
        }
    </>);
}

export function DateSegment({ dateKey, docArr = [] }) {

    const [open, setOpen] = useState(true);
    const [mark, setMark] = useState(false);
    const [state, action, _] = useActionState(cancelManyBookingsServerAction, { ok: false, message: "" });

    const rowsForDate = docArr.filter(r => r.dateKey === dateKey);
    const doctorsOnThisDate = [...new Set(rowsForDate.map(r => r.doctor_public_id))];
    const allBookingIds = rowsForDate.map(r => r.booking_public_id);
    const meta = rowsForDate[0];

    return (<>
        {rowsForDate.length > 0 && <>
            <div className="border-2 border-red-400 m-4 ">
                <h1>{meta.day_name[0].toUpperCase() + meta.day_name.slice(1)}, {meta.date} {meta.month_name} {meta.year}</h1>
                <button onClick={() => setOpen(!open)}>{open ? "Hide" : "Show"}</button>
                <button onClick={() => setMark(!mark)}>{mark ? "Back" : "Cancel Appointments on This Day â¬…"}</button>
                {mark && <>
                    <p>Are you sure? All bookings on this day will be cancelled and patients will be notified to reschedule</p>
                    <form action={action}>
                        <input type="hidden" name="booking_ids" value={JSON.stringify(allBookingIds)} />
                        <button type="submit">Yes</button>
                    </form>
                </>}
                {open && <>
                    {doctorsOnThisDate.map(publicId => (
                        <div key={publicId} className="border-2 border-orange-400 m-4 ">
                            <DoctorSegment publicId={publicId} dateKey={dateKey} docArr={docArr} />
                        </div>
                    ))}
                </>}
            </div>
        </>}
    </>);
}

export function DoctorSegment({ publicId, dateKey, docArr = [] }) {

    const [open, setOpen] = useState(false);
    const [mark, setMark] = useState(false);
    const [state, action, _] = useActionState(cancelManyBookingsServerAction, { ok: false, message: "" });

    const bookingsForThisDocOnThisDate = docArr.filter(r => r.doctor_public_id === publicId && r.dateKey === dateKey);
    const allBookingIds = bookingsForThisDocOnThisDate.map(r => r.booking_public_id);
    const meta = bookingsForThisDocOnThisDate[0];

    return (<>
        {bookingsForThisDocOnThisDate.length > 0 && <>
            <div>
                <h2>Dr. {meta.name} â€” {meta.department}</h2>
                <button onClick={() => setOpen(!open)}>{open ? "Hide" : "Show"}</button>
                <button onClick={() => setMark(!mark)}>{mark ? "Back" : "Cancel Doctor's Day"}</button>
                {mark && <>
                    <p>Are you sure? All of Dr. {meta.name}'s bookings on this day will be cancelled</p>
                    <form action={action}>
                        <input type="hidden" name="booking_ids" value={JSON.stringify(allBookingIds)} />
                        <button type="submit">Yes</button>
                    </form>
                </>}
                {open && <>
                    {bookingsForThisDocOnThisDate.map(booking => (
                        <SingleBooking key={booking.booking_public_id} obj={booking} />
                    ))}
                </>}
            </div>
        </>}
    </>);
}

export function SingleBooking({ obj }) {

    const [state, action, _] = useActionState(cancelBookingServerAction, { ok: false, message: "" });
    const [mark, setMark] = useState(false);

    return (<>
        <div className="border-2 m-2">
            <p>Patient Name: {obj.patient_name}</p>
            <p>Time: {minutesToMeridiem(obj.treatment_start, true)} - {minutesToMeridiem(obj.treatment_end, true)}</p>
            <p>Status: {obj.status[0].toUpperCase() + obj.status.slice(1)}</p>
            <button onClick={() => setMark(!mark)}>{mark ? "Back" : "Cancel Booking â¬…"}</button>
            {mark && <>
                <p>Are you sure? Patient will be notified to reschedule.</p>
                <form action={action}>
                    <input type="hidden" name="booking_public_id" value={obj.booking_public_id} />
                    <button type="submit">Yes</button>
                </form>
            </>}
        </div>
    </>);
}
```

---

## src\app\appointments\page.jsx

```
import { db } from "../lib/turso";
import ClientAppointments from "./Client";

export default async function Appointments() {

    const d = new Date();
    const currentDate = d.getDate();
    const currentMonthNumber = d.getMonth();
    const currentYear = d.getFullYear();

    const fetchDocsWithBookings = await db.execute(`
        SELECT d.public_id AS doctor_public_id, d.department, d.name, d.title, d.created_at AS doctor_created_at, b.public_id AS booking_public_id, b.doctor_name, b.patient_name, b.patient_email, b.patient_phone, b.treatment_type, b.treatment_start, b.treatment_end, b.date, b.month_name, b.month_number, b.year, b.day_name, b.day_number, b.booking_registered_at, b.status
        FROM doctors d
        INNER JOIN bookings b ON b.doctor_id = d.id WHERE b.date >= ? AND b.month_number = ? AND b.year = ? AND b.status = 'verified'
        ORDER BY b.year ASC, b.month_number ASC, b.date ASC, b.treatment_start ASC 
    `, [currentDate, currentMonthNumber, currentYear]);

    const rows = fetchDocsWithBookings?.rows || [];

    const docArrSafe = rows.map(fn => ({
        doctor_public_id: fn.doctor_public_id,
        booking_public_id: fn.booking_public_id,
        department: fn.department,
        name: fn.name,
        title: fn.title,
        doctor_created_at: fn.doctor_created_at,
        doctor_name: fn.doctor_name,
        patient_name: fn.patient_name,
        patient_email: fn.patient_email,
        patient_phone: fn.patient_phone,
        treatment_type: fn.treatment_type,
        treatment_start: fn.treatment_start,
        treatment_end: fn.treatment_end,
        date: fn.date,
        month_name: fn.month_name,
        month_number: fn.month_number,
        year: fn.year,
        day_name: fn.day_name,
        day_number: fn.day_number,
        booking_registered_at: fn.booking_registered_at,
        status: fn.status,
        dateKey: `${fn.year}-${fn.month_number}-${fn.date}`
    }));

    const dateKeys = [...new Set(docArrSafe.map(r => r.dateKey))];


    console.log("docArrSafe", docArrSafe);
    console.log("dateKeys", dateKeys);
    //console.log("docPublicIds", docPublicIds);

    return <ClientAppointments dateKeysFromParent={dateKeys} docArrFromParent={docArrSafe} />;
}
```

---

## src\app\appointments\SA.js

```
'use server'

import { db } from "../lib/turso";

export async function cancelBookingServerAction(prevState, formData) {
    const booking_public_id = formData.get("booking_public_id");
    try {
        await db.execute({ sql: `UPDATE bookings SET status = 'cancelled' WHERE public_id = ?`, args: [booking_public_id] });
        return { ok: true, message: "Booking cancelled." };
    } catch (e) {
        return { ok: false, message: "Failed to cancel booking." };
    }
}

export async function cancelManyBookingsServerAction(prevState, formData) {
    const booking_ids = JSON.parse(formData.get("booking_ids"));
    try {
        await Promise.all(
            booking_ids.map(id => db.execute({ sql: `UPDATE bookings SET status = 'cancelled' WHERE public_id = ?`, args: [id] }))
        );
        return { ok: true, message: "All bookings cancelled." };
    } catch (e) {
        return { ok: false, message: "Failed to cancel bookings." };
    }
}
export async function fetchAllBookings(dateObj = new Date(), searchValue = "") {

    try {
        const d = dateObj;
        const currentDate = d.getDate();
        const currentMonthNumber = d.getMonth();
        const currentYear = d.getFullYear();
        let seachString = null;
        if (searchValue === "all") seachString = ` AND b.status = 'verified' OR b.status = 'pending'`;
        if (searchValue === "cancelled") seachString = ` AND b.status = 'cancelled'`;
        if (searchValue !== "all" || searchValue !== "cancelled") seachString = ` AND b.status = 'verified' OR b.status = 'pending'`;

        const fetchDocsWithBookings = await db.execute(`
        SELECT d.public_id AS doctor_public_id, d.department, d.name, d.title, d.created_at AS doctor_created_at, b.public_id AS booking_public_id, b.doctor_name, b.patient_name, b.patient_email, b.patient_phone, b.treatment_type, b.treatment_start, b.treatment_end, b.date, b.month_name, b.month_number, b.year, b.day_name, b.day_number, b.booking_registered_at, b.status
        FROM doctors d
        INNER JOIN bookings b ON b.doctor_id = d.id WHERE b.date >= ? AND b.month_number = ? AND b.year = ? ${seachString}
        ORDER BY b.year ASC, b.month_number ASC, b.date ASC, b.treatment_start ASC 
    `, [currentDate, currentMonthNumber, currentYear]);

        const rows = fetchDocsWithBookings?.rows || [];

        const docArrSafe = rows.map(fn => ({
            doctor_public_id: fn.doctor_public_id,
            booking_public_id: fn.booking_public_id,
            department: fn.department,
            name: fn.name,
            title: fn.title,
            doctor_created_at: fn.doctor_created_at,
            doctor_name: fn.doctor_name,
            patient_name: fn.patient_name,
            patient_email: fn.patient_email,
            patient_phone: fn.patient_phone,
            treatment_type: fn.treatment_type,
            treatment_start: fn.treatment_start,
            treatment_end: fn.treatment_end,
            date: fn.date,
            month_name: fn.month_name,
            month_number: fn.month_number,
            year: fn.year,
            day_name: fn.day_name,
            day_number: fn.day_number,
            booking_registered_at: fn.booking_registered_at,
            status: fn.status,
            dateKey: `${fn.year}-${fn.month_number}-${fn.date}`
        }));

        const dateKeys = [...new Set(docArrSafe.map(r => r.dateKey))];

        return { dateKeys, docArrSafe }


    } catch (e) {
        console.log(e);
        return { ok: false, message: "Failed to fetch bookings." };
    }
}
```

---

## src\app\appointments\[pId]\page.jsx

```
import { db } from "../../lib/turso";

export default async function AppointmentByDoctor({ params }) {
    const { pId } = await params;

    const d = new Date();
    const currentMonthNumber = d.getMonth();
    const year = d.getFullYear();

    const fetchDoctorDetails = await db.execute("SELECT id, name, department FROM doctors WHERE public_id = ?", [pId]);
    const doctorId = fetchDoctorDetails.rows[0]?.id;
    const doctorName = fetchDoctorDetails.rows[0]?.name;
    const department = fetchDoctorDetails.rows[0]?.department;
    if (!doctorId) return <div>Doctor not found</div>;

    const fetchBookings = await db.execute(`SELECT * FROM bookings WHERE doctor_id = ? AND year = ? AND month_number = ?`, [doctorId, year, currentMonthNumber]);
    const bookings = fetchBookings.rows;
    if (bookings.length === 0) return <div>No bookings found</div>;



    return (<>
        <div>{pId}</div>
    </>);
}
```

---

## src\app\booking\page.jsx

```
import acquireDoctorsData from "../lib/acquireDocData";
import ShowDocsByDep from "../components/ShowDocsByDep";


export default async function Bookings() {

    const { doctorsArr, departments } = await acquireDoctorsData();
        const linkSegment = "/booking/";
    
    
    
        return (
            <ShowDocsByDep
                departmentsSer={JSON.stringify(departments)}
                doctorsArrSer={JSON.stringify(doctorsArr)}
                linkSegment={linkSegment}
            />
        );
}
```

---

## src\app\booking\[pId]\bookingSA.js

```
"use server";

import { nanoid } from "nanoid";
import { db } from "../../lib/turso";
import { initBookingsTable } from "../../models/initiTables";
import { redirect } from "next/navigation";

export async function bookingServerAction(formData) {
    try {
        const doctorPublicId = formData.get("doctorPublicId");
        const name = formData.get("full_name");
        const email = formData.get("email");
        const phone = formData.get("phone");
        const treatment = formData.get("treatment");
        const slot = JSON.parse(formData.get("slot"));

        const monthName = slot.baseSlot.monthName;
        const monthNumber = slot.baseSlot.month_number;
        const date = slot.baseSlot.date;
        const dayName = slot.baseSlot.day;
        const dayNumber = slot.baseSlot.day_number;
        const year = slot.baseSlot.year;

        const userSlot = slot.selectedSlot;

        const treatmentTime = 10;

        //================ Doctor Verification Check ================//
        const fetchDoctorDetails = await db.execute("SELECT id, name FROM doctors WHERE public_id = ?", [doctorPublicId]);
        const doctorId = fetchDoctorDetails.rows[0]?.id;
        const doctorName = fetchDoctorDetails.rows[0]?.name;
        if (!doctorId) throw new Error("Doctor not found");

        //================ Booking Slot Verification Check ================//
        const fetchWeeklyTemplates = await db.execute(
            `SELECT * FROM weekly_template WHERE day_number = ? AND month_number = ? AND doctor_id = ? AND \`date\` = ? AND year = ? AND status = 1`,
            [dayNumber, monthNumber, doctorId, date, year]
        );
        const weeklyTemplates = fetchWeeklyTemplates?.rows[0];
        if (!weeklyTemplates) throw new Error("Invalid booking slot");

        const virtualSlotsBase = [
            { start: weeklyTemplates.start_time, end: weeklyTemplates.break_start },
            { start: weeklyTemplates.break_end, end: weeklyTemplates.end_time }
        ];
        const filteredBase = virtualSlotsBase.filter(s => s.start != null && s.end != null);
        if (filteredBase.length === 0) throw new Error("Invalid booking slot");

        //== Validate that userSlot falls within one of the server-side base slots ===//
        const slotIsInBase = filteredBase.some(fn => userSlot.start >= fn.start && userSlot.end <= fn.end);
        if (!slotIsInBase) throw new Error("Invalid booking slot");

        //================ Existing Bookings Verification Check ================//
        await initBookingsTable();
        const fetchExistingBookings = await db.execute(
            `SELECT * FROM bookings WHERE doctor_id = ? AND \`date\` = ? AND day_name = ? AND day_number = ? AND month_name = ? AND year = ?`,
            [doctorId, date, dayName, dayNumber, monthName, year]
        );

        const existingBookings = fetchExistingBookings.rows;
        const existingVirtualSlots = existingBookings.map(fn => ({ start: fn.treatment_start, end: fn.treatment_end }));

        let overlap = false;
        const validTreatmentSlot = userSlot.end - userSlot.start === treatmentTime;
        const bufferTime = weeklyTemplates.buffer_minutes;

        if (existingVirtualSlots.length > 0) {
            for (const segment of existingVirtualSlots) {
                if (userSlot.start < segment.end + bufferTime && userSlot.end > segment.start - bufferTime) {
                    overlap = true;
                    break;
                }
            }
        }

        if (overlap) throw new Error("Slot is already taken");
        if (!validTreatmentSlot) throw new Error("Invalid treatment slot");

        await db.execute(
            `INSERT INTO bookings (public_id, doctor_id, doctor_name, patient_name, patient_email, patient_phone, treatment_type, treatment_start, treatment_end, \`date\`, month_name, month_number, day_name, day_number, year) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [nanoid(), doctorId, doctorName, name, email, phone, treatment, userSlot.start, userSlot.end, date, monthName, monthNumber, dayName, dayNumber, year]
        );

    } catch (error) {
        console.error(error);
        return { ok: false, message: error.message };
    }

    redirect("/booking");
}
```

---

## src\app\booking\[pId]\ClientBooking.jsx

```
'use client';

import { minutesToMeridiem } from "../../utils/minutes-to-meridiem";
import Form from "next/form";
import { bookingServerAction } from "./bookingSA";
import { useState } from "react";

export default function ClientBooking({ currentMonthSlots, monthName, doctorPublicId }) {


    let treatmentTime = 10;
    let treatmentType = "treatmentPlaceholder";

    const [userSlot, setUserSlot] = useState(null);

    console.log("userSlot", userSlot);



    const enrichedSlots = currentMonthSlots.map(daySegment => {
        const slots = [];
        for (const slotSegment of daySegment.freeVirtualSlots) {
            let cursor = slotSegment.start;
            while (cursor + treatmentTime <= slotSegment.end) {
                slots.push({ start: cursor, end: cursor + treatmentTime });
                cursor = cursor + treatmentTime + daySegment.buffer_minutes;
            }
        }
        return { ...daySegment, virtualSlotsForTreatment: slots };
    });


    return (<>
        {!userSlot && <>
            <div>{monthName ?? "dummy month"} Slots</div>
            {enrichedSlots.map((daySegment, index) => (
                <div key={daySegment.public_id + index}>
                    <div className=" text-green-400">
                        {daySegment.day[0].toUpperCase() + daySegment.day.slice(1)} {daySegment.monthName}-{daySegment.date > 9 ? String(daySegment.date) : "0" + daySegment.date}-{daySegment.year}
                    </div>
                    {daySegment.virtualSlotsForTreatment.map(slot => (
                        <button onClick={() =>
                            setUserSlot({
                                baseSlot: {
                                    monthName: daySegment.monthName,
                                    month_number: daySegment.month_number,
                                    date: daySegment.date,
                                    day: daySegment.day,
                                    day_number: daySegment.day_number,
                                    year: daySegment.year,
                                },
                                selectedSlot: slot
                            })} className="p-2 m-2 border-2" key={slot.start}>{minutesToMeridiem(slot.start, true)} - {minutesToMeridiem(slot.end, true)}
                        </button>)
                    )}
                </div>
            ))}
        </>}
        {userSlot && <button onClick={() => setUserSlot(null)} >Choose another slot</button>}
        {
            userSlot &&
            <>
                <Form action={bookingServerAction}>
                    <input type="hidden" name="doctorPublicId" value={doctorPublicId} />
                    <input type="hidden" name="slot" value={JSON.stringify(userSlot)} />
                    <input type="text" name="full_name" placeholder="Full Name" />
                    <input type="text" name="phone" placeholder="Phone" />
                    <input type="text" name="email" placeholder="Email" />
                    <input type="hidden" name="treatment" value={treatmentType} />
                    <button type="submit">Submit</button>
                </Form>
            </>
        }
    </>);
}
```

---

## src\app\booking\[pId]\page.jsx

```
import Link from "next/link";
import ClientBooking from "./ClientBooking";
import { db } from "../../lib/turso";
import { getSlots } from "../../lib/getSlots";

export default async function Slots({ params }) {

    const { pId } = await params;
    const fetchDoctors = await db.execute(`SELECT * FROM doctors WHERE public_id = ?`, [pId]);
    const doctorId = fetchDoctors.rows[0].id;

    if (!doctorId) return <div>Doctor not found</div>

    const monthsCode = [
        { month: "January", code: 0 }, { month: "February", code: 1 }, { month: "March", code: 2 },
        { month: "April", code: 3 }, { month: "May", code: 4 }, { month: "June", code: 5 },
        { month: "July", code: 6 }, { month: "August", code: 7 }, { month: "September", code: 8 },
        { month: "October", code: 9 }, { month: "November", code: 10 }, { month: "December", code: 11 }
    ];

    const d = new Date();
    const currentMonthNumber = d.getMonth();
    const currentMonthName = monthsCode.find((mn) => mn.code === currentMonthNumber).month;
    const result = await getSlots(d, doctorId);

    if (result.length === 0) return <>
        <p>There are no slots. Go to Manage Weekly Template</p>
        <Link href="/manage-weekly-template"> ðŸ‘‰ Manage Weekly Template</Link>
    </>


    return (<>
        <ClientBooking currentMonthSlots={result} monthName={currentMonthName} doctorPublicId={pId} />
    </>);
}
```

---

## src\app\components\ShowDocsByDep.jsx

```
'use client';

import Link from "next/link";


export default function ShowDocsByDep({ departmentsSer = [], doctorsArrSer = [], linkSegment = "/" }) {
    
    const departments = JSON.parse(departmentsSer);
    const doctorsArr = JSON.parse(doctorsArrSer);

    return (<>
        <div>
            {departments.map((department) => (
                <div key={department}>
                    <h2>{department}</h2>
                    {doctorsArr
                        .filter((doc) => doc.department === department)
                        .map((fn) => (
                            <Link
                                href={`${linkSegment}${fn.public_id}`}
                                key={fn.public_id}
                            >
                                {fn.name}
                            </Link>
                        ))
                    }
                </div>
            ))}
        </div>
    </>);
}
```

---

## src\app\edit-weekly-template\[publicId]\Client.jsx

```
'use client';

import Form from "next/form";
import { minutesToMeridiem } from "../../utils/minutes-to-meridiem";
import { editWeeklyTemplateServerAction } from "./editTemplateSA";
import { useState } from "react";

export default function Client({ template, bookings, doctorName }) {

    const [showBookings, setShowBookings] = useState(false);
    const [update, setUpdate] = useState(false);

    const defaultBuffer = template.buffer_minutes;

    const defaultStartHr = minutesToMeridiem(template.start_time, false).hrs;
    const defaultStartMin = minutesToMeridiem(template.start_time, false).mins;
    const defaultStartMeridiem = minutesToMeridiem(template.start_time, false).meridiem;

    const defaultEndHr = minutesToMeridiem(template.end_time, false).hrs;
    const defaultEndMin = minutesToMeridiem(template.end_time, false).mins;
    const defaultEndMeridiem = minutesToMeridiem(template.end_time, false).meridiem;

    const defaultBreakStartHr = minutesToMeridiem(template.break_start, false).hrs;
    const defaultBreakStartMin = minutesToMeridiem(template.break_start, false).mins;
    const defaultBreakStartMeridiem = minutesToMeridiem(template.break_start, false).meridiem;

    const defaultBreakEndHr = minutesToMeridiem(template.break_end, false).hrs;
    const defaultBreakEndMin = minutesToMeridiem(template.break_end, false).mins;
    const defaultBreakEndMeridiem = minutesToMeridiem(template.break_end, false).meridiem;



    const dummyHrs = [];
    for (let i = 1; i <= 12; i++) {
        if (i < 10) dummyHrs.push("0" + i);
        else dummyHrs.push(String(i));
    }

    const dummyMinutes = [];
    for (let i = 0; i <= 59; i++) {
        if (i < 10) dummyMinutes.push("0" + i);
        else dummyMinutes.push(String(i));
    }

    const meridiem = ["AM", "PM"];




    return (<>
        <h2>Doctor Name: {doctorName}</h2>
        <h2>{template.month_name[0].toUpperCase() + template.month_name.slice(1)} {template.date > 9 ? template.date : "0" + template.date} {template.day[0].toUpperCase() + template.day.slice(1)}</h2>
        <Form action={editWeeklyTemplateServerAction} className="space-y-6 p-6 bg-gray-50 dark:bg-gray-900 rounded-md">
            <input type="hidden" name="publicId" value={template?.public_id} />
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                Buffer in minutes
            </label>
            <input defaultValue={defaultBuffer} type="number" name="buffer" placeholder="Buffer in minutes" className="border border-gray-300 dark:border-gray-700 rounded-md px-3 py-2 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100" />

            <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                    Select Clinic Start time
                </label>
                <div className="flex gap-2 items-center">
                    <select
                        name="startHr"
                        className="border border-gray-300 dark:border-gray-700 rounded-md px-3 py-2 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100"
                        defaultValue={defaultStartHr}
                    >
                        {dummyHrs.map((hr) => (
                            <option value={hr} key={hr}>
                                {hr}
                            </option>
                        ))}
                    </select>
                    <select
                        name="startMin"
                        className="border border-gray-300 dark:border-gray-700 rounded-md px-3 py-2 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100"
                        defaultValue={defaultStartMin}
                    >
                        {dummyMinutes.map((min) => (
                            <option value={min} key={min}>
                                {min}
                            </option>
                        ))}
                    </select>
                    <select
                        defaultValue={defaultStartMeridiem}
                        name="startMeridiem"
                        className="border border-gray-300 dark:border-gray-700 rounded-md px-3 py-2 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100"
                    >
                        {meridiem.map((mer) => (
                            <option value={mer} key={mer}>
                                {mer}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                    Select Clinic End time
                </label>
                <div className="flex gap-2 items-center">
                    <select
                        defaultValue={defaultEndHr}
                        name="endHr"
                        className="border border-gray-300 dark:border-gray-700 rounded-md px-3 py-2 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100"
                    >
                        {dummyHrs.map((hr) => (
                            <option value={hr} key={hr}>
                                {hr}
                            </option>
                        ))}
                    </select>
                    <select
                        defaultValue={defaultEndMin}
                        name="endMin"
                        className="border border-gray-300 dark:border-gray-700 rounded-md px-3 py-2 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100"
                    >
                        {dummyMinutes.map((min) => (
                            <option value={min} key={min}>
                                {min}
                            </option>
                        ))}
                    </select>
                    <select
                        defaultValue={defaultEndMeridiem}
                        name="endMeridiem"
                        className="border border-gray-300 dark:border-gray-700 rounded-md px-3 py-2 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100"
                    >
                        {meridiem.map((mer) => (
                            <option value={mer} key={mer}>
                                {mer}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Break Start</label>
                    <div className="flex gap-2 items-center">
                        <select
                            defaultValue={defaultBreakStartHr}
                            name="breakStartHr"
                            className="border border-gray-300 dark:border-gray-700 rounded-md px-3 py-2 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100"
                        >
                            {dummyHrs.map((hr) => (
                                <option value={hr} key={hr}>
                                    {hr}
                                </option>
                            ))}
                        </select>
                        <select
                            defaultValue={defaultBreakStartMin}
                            name="breakStartMin"
                            className="border border-gray-300 dark:border-gray-700 rounded-md px-3 py-2 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100"
                        >
                            {dummyMinutes.map((min) => (
                                <option value={min} key={min}>
                                    {min}
                                </option>
                            ))}
                        </select>
                        <select
                            defaultValue={defaultBreakStartMeridiem}
                            name="breakStartMeridiem"
                            className="border border-gray-300 dark:border-gray-700 rounded-md px-3 py-2 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100"
                        >
                            {meridiem.map((mer) => (
                                <option value={mer} key={mer}>
                                    {mer}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Break End</label>
                    <div className="flex gap-2 items-center">
                        <select
                            defaultValue={defaultBreakEndHr}
                            name="breakEndHr"
                            className="border border-gray-300 dark:border-gray-700 rounded-md px-3 py-2 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100"
                        >
                            {dummyHrs.map((hr) => (
                                <option value={hr} key={hr}>
                                    {hr}
                                </option>
                            ))}
                        </select>
                        <select
                            defaultValue={defaultBreakEndMin}
                            name="breakEndMin"
                            className="border border-gray-300 dark:border-gray-700 rounded-md px-3 py-2 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100"
                        >
                            {dummyMinutes.map((min) => (
                                <option value={min} key={min}>
                                    {min}
                                </option>
                            ))}
                        </select>
                        <select
                            defaultValue={defaultBreakEndMeridiem}
                            name="breakEndMeridiem"
                            className="border border-gray-300 dark:border-gray-700 rounded-md px-3 py-2 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100"
                        >
                            {meridiem.map((mer) => (
                                <option value={mer} key={mer}>
                                    {mer}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            <div>
                {!update && <button onClick={() => setUpdate(true)} >Update</button>}
                {update && <>
                    {bookings.length > 0 ? <h2>Warning, There are {bookings.length} bookings associated with this template. If you proceed with this action: even without new changes the associated bookings will be cancelled and patients will be notified to reschedule. </h2> : <h2>Are you sure you want to update this template</h2>}
                    <button
                        type="submit"
                        className="mt-2 inline-flex items-center justify-center rounded-md bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 px-4 py-2 text-sm font-semibold text-white focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                    >
                        Proceed
                    </button>
                </>}
                {update && <button onClick={() => setUpdate(false)}>Cancel</button>}

            </div>
        </Form>
        {bookings.length > 0 && <>
            <h2>Bookings Found : {bookings.length}</h2>
            <button onClick={() => setShowBookings(!showBookings)}>{showBookings ? "Hide Bookings" : "Show Bookings"}</button>
        </>}
        {showBookings && <>
            {bookings.map((booking) => (
                <div key={booking.bookingPublicId} className="border-2">
                    <p>Patient Name: {booking.patientName}</p>
                    <p>Appointment: {minutesToMeridiem(booking.start_time, true)}- {minutesToMeridiem(booking.end_time, true)}</p>
                    <p>Treatment Type: {booking.treatment}</p>

                </div>
            ))}
        </>}
    </>);
}
```

---

## src\app\edit-weekly-template\[publicId]\editTemplateSA.js

```
"use server";

import { redirect } from "next/navigation";
import { db } from "../../lib/turso";

export async function editWeeklyTemplateServerAction(formData) {

    const templatePublicId = formData.get("publicId");

    const fetchTemplate = await db.execute("SELECT * FROM weekly_template WHERE public_id = ?", [templatePublicId]);
    if (fetchTemplate.rows.length === 0) return null;

    const templateId = fetchTemplate.rows[0].id;


    const buffer = Number(formData.get("buffer"));

    const startHr = formData.get("startHr");
    const startMin = formData.get("startMin");
    const startMeridiem = formData.get("startMeridiem");

    const endHr = formData.get("endHr");
    const endMin = formData.get("endMin");
    const endMeridiem = formData.get("endMeridiem");

    const breakStartHr = formData.get("breakStartHr");
    const breakStartMin = formData.get("breakStartMin");
    const breakStartMeridiem = formData.get("breakStartMeridiem");

    const breakEndHr = formData.get("breakEndHr");
    const breakEndMin = formData.get("breakEndMin");
    const breakEndMeridiem = formData.get("breakEndMeridiem");


    const startInMinutes = getMinutes(startHr, startMin, startMeridiem);
    const endInMinutes = getMinutes(endHr, endMin, endMeridiem);
    const breakStartInMinutes = getMinutes(breakStartHr, breakStartMin, breakStartMeridiem);
    const breakEndInMinutes = getMinutes(breakEndHr, breakEndMin, breakEndMeridiem);



    try {
        await db.execute(`
        UPDATE weekly_template SET
        start_time = ?, end_time = ?, break_start = ?, break_end = ?, buffer_minutes = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?`, [startInMinutes, endInMinutes, breakStartInMinutes, breakEndInMinutes, buffer, templateId]
        );


    } catch (error) {
        console.error(error);
        return null;
    }
    redirect(`/edit-weekly-template/${templatePublicId}`);
}



function getMinutes(hr, min, meridiem) {
    let h = Number(hr);
    const m = Number(min);
    if (meridiem === "PM" && h !== 12) h += 12;
    if (meridiem === "AM" && h === 12) h = 0;
    return (h * 60) + m;
};
```

---

## src\app\edit-weekly-template\[publicId]\page.jsx

```
import { db } from "../../lib/turso";
import { initBookingsTable } from "../../models/initiTables";
import Client from "./Client";

export default async function EditWeeklyTemplate({ params }) {

    await initBookingsTable();

    const { publicId } = await params;

    const fetch = await db.execute("SELECT * FROM weekly_template WHERE public_id = ?", [publicId]);
    if (fetch.rows.length === 0) return <div>Template not found</div>;

    const template = fetch.rows[0];
    const monthNumber = template.month_number;
    const date = template.date;
    const doctorName = template.doctor_name || "Unavailable";

    const fetchBookings = await db.execute(`SELECT * FROM bookings WHERE month_number = ? AND date = ?`, [monthNumber, date]);
    const bookings = fetchBookings.rows;

    const bookingsArr = [];
    if (bookings.length > 0) {
        for (let booking of bookings) {
            bookingsArr.push({
                date: booking.date,
                start_time: booking.treatment_start,
                end_time: booking.treatment_end,
                treatment: booking.treatment_type,
                patientName: booking.patient_name,
                bookingPublicId: booking.public_id
            });
        };
    };

    const templateSafe = {
        public_id: template.public_id,
        status: template.status,
        doctor_id: template.doctor_id,
        day: template.day,
        day_number: template.day_number,
        month_name: template.month_name,
        date: template.date,
        start_time: template.start_time,
        end_time: template.end_time,
        break_start: template.break_start,
        break_end: template.break_end,
        buffer_minutes: template.buffer_minutes
    }

    return (<>
        <Client template={templateSafe} bookings={bookingsArr} doctorName={doctorName} />
    </>);
}
```

---

## src\app\lib\acquireDocData.js

```
import { db } from "./turso";

export default async function acquireDoctorsData() {

    const fetchDoctors = await db.execute("SELECT * FROM doctors");
    const doctorsArr = fetchDoctors?.rows || [];
    const departments = [...new Set(doctorsArr.map(r => r.department))];

    return { doctorsArr, departments };
}
```

---

## src\app\lib\createNextMonthSlots.js

```
"use server";

export async function createNextMonthSlots(formData) {
  try {
    
  } catch (error) {
    console.error(error);
    throw error;
  }
}
```

---

## src\app\lib\getSlots.js

```
import { db } from "../lib/turso";

export const getSlots = async (dateObj, doctorId) => {

    const daysCode = [
        { day: "Sunday", code: 0 },
        { day: "Monday", code: 1 },
        { day: "Tuesday", code: 2 },
        { day: "Wednesday", code: 3 },
        { day: "Thursday", code: 4 },
        { day: "Friday", code: 5 },
        { day: "Saturday", code: 6 }
    ];
    const monthsCode = [
        { month: "January", code: 0 }, { month: "February", code: 1 }, { month: "March", code: 2 },
        { month: "April", code: 3 }, { month: "May", code: 4 }, { month: "June", code: 5 },
        { month: "July", code: 6 }, { month: "August", code: 7 }, { month: "September", code: 8 },
        { month: "October", code: 9 }, { month: "November", code: 10 }, { month: "December", code: 11 }
    ];

    const d = dateObj;
    const currentDate = d.getDate();
    const currentMonth = d.getMonth();
    const currentMonthName = monthsCode.find(fn => fn.code === currentMonth).month;
    const nextMonth = d.getMonth() + 1;
    const currentYear = d.getFullYear();
    const currentMonthNumberOfDays = new Date(currentYear, nextMonth, 0).getDate();



    const fetchWeeklyTemplate = await db.execute(`SELECT * FROM weekly_template WHERE month_number = ? AND status = ? AND year = ? AND doctor_id = ?`, [currentMonth, 1, currentYear, doctorId]);
    const weeklyTemplate = fetchWeeklyTemplate.rows;

    if (weeklyTemplate.length === 0) return [];


    const fetchCurrentMonthBooking = await db.execute(`SELECT date, month_name AS month, treatment_start AS start, treatment_end AS end FROM bookings WHERE month_name = ? AND year = ? AND doctor_id = ?`, [currentMonthName, currentYear, doctorId]);

    const currentMonthBookings = fetchCurrentMonthBooking.rows;
    const currentMonthSlots = [];

    for (let i = currentDate; i <= currentMonthNumberOfDays; i++) {
        let freeVirtualSlots = [];

        const dayNumAtPeriod = new Date(currentYear, currentMonth, i).getDay();

        const templateAtPeriod = weeklyTemplate.find(fn => fn.date === i && fn.day_number === dayNumAtPeriod);
        if (!templateAtPeriod) continue; // imp check to skip empty days starting next iteration


        const bookingsAtPeriod = [];
        for (const booking of currentMonthBookings) {
            if (booking.date === i) {
                bookingsAtPeriod.push({ start: booking.start, end: booking.end });
            }
        };

        const leftSlot = { start: templateAtPeriod.start_time, end: templateAtPeriod.break_start };
        const rightSlot = { start: templateAtPeriod.break_end, end: templateAtPeriod.end_time };
        const baseSlots = [leftSlot, rightSlot].filter(slot => slot.start != null && slot.end != null);
        freeVirtualSlots = [...baseSlots];

        const sortedBookings = bookingsAtPeriod.sort((a, b) => a.start - b.start);


        if (sortedBookings.length > 0) {
            freeVirtualSlots = [];
            for (const baseSlot of baseSlots) {
                let segments = [baseSlot];

                for (const booking of sortedBookings) {
                    let newSegments = [];
                    const buffer = templateAtPeriod.buffer_minutes;
                    const bufferedStart = booking.start - buffer;
                    const bufferedEnd = booking.end + buffer;

                    for (const segment of segments) {
                        // NO OVERLAP
                        if (bufferedEnd <= segment.start || bufferedStart >= segment.end) {
                            newSegments.push(segment);
                            continue;
                        }

                        // LEFT PART
                        if (bufferedStart > segment.start) {
                            newSegments.push({
                                start: segment.start,
                                end: bufferedStart
                            });
                        }

                        // RIGHT PART
                        if (bufferedEnd < segment.end) {
                            newSegments.push({
                                start: bufferedEnd,
                                end: segment.end
                            });
                        }
                    }
                    segments = newSegments;
                }
                freeVirtualSlots.push(...segments);
            }
        }

        currentMonthSlots.push({
            public_id: templateAtPeriod.public_id,
            status: templateAtPeriod.status,
            date: i,
            monthName: currentMonthName,
            month_number: currentMonth,
            year: currentYear,
            day: templateAtPeriod.day,
            day_number: templateAtPeriod.day_number,
            start_time: templateAtPeriod.start_time,
            end_time: templateAtPeriod.end_time,
            break_start: templateAtPeriod.break_start,
            break_end: templateAtPeriod.break_end,
            buffer_minutes: templateAtPeriod.buffer_minutes,
            virtualSlotsBase: baseSlots,
            freeVirtualSlots
        });

    }
    //console.dir(currentMonthSlots, { depth: null });
    return currentMonthSlots;



}
```

---

## src\app\lib\turso.js

```
import { createClient } from "@libsql/client";

export const db = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});
```

---

## src\app\manage-weekly-template\page.jsx

```
import acquireDoctorsData from "../lib/acquireDocData";
import ShowDocsByDep from "../components/ShowDocsByDep";


export default async function ManageWeeklyTemplates() {

    const { doctorsArr, departments } = await acquireDoctorsData();
    const linkSegment = "/manage-weekly-template/";



    return (
        <ShowDocsByDep
            departmentsSer={JSON.stringify(departments)}
            doctorsArrSer={JSON.stringify(doctorsArr)}
            linkSegment={linkSegment}
        />
    );
}


```

---

## src\app\manage-weekly-template\[publicId]\Client.jsx

```
"use client"; // 1. Added the missing directive

import Link from "next/link";
import Form from "next/form";
import { useRouter } from 'next/navigation'
import { useActionState, useEffect, useState } from "react";
import { minutesToMeridiem } from "../../utils/minutes-to-meridiem";
import { toggleTemplateStatusServerAction } from "./deactivateSA";
import { createNextMonthSlots } from "../../lib/createNextMonthSlots";




export default function Client({ templates, publicId, bookings }) {

    const router = useRouter();

    const allDaysFromDb = templates.map((template) => template.day);
    const uniqueDays = [...new Set(allDaysFromDb)];


    const handleNextMonthSlots = async () => {
        const res = await createNextMonthSlots(publicId);
        router.refresh();
    }

    const handleDeactivate = () => router.refresh();


    if (templates.length === 0) return <p>No templates found.</p>;

    return (
        <>
            {templates.length > 0 && <>
                <p>Create Slots For Next Month Using Current Setup </p>
                <button onClick={handleNextMonthSlots}>Create â¬…</button>
            </>}

            {uniqueDays.map((day) => (
                <div key={day}>
                    <h2>{day[0].toUpperCase() + day.slice(1)}</h2>
                    <div className="flex flex-row flex-wrap">
                        {templates
                            .filter((template) => template.day === day)
                            .map((template) => (
                                <TemplateItem
                                    key={template.public_id}
                                    template={template}
                                    bookings={bookings}
                                    handleDeactivate={handleDeactivate}
                                />
                            ))}
                    </div>
                </div>
            ))}




        </>
    );
}





function TemplateItem({ template, bookings, handleDeactivate }) {

    const [state, action, inPending] = useActionState(toggleTemplateStatusServerAction, { ok: false, message: "" });
    const [deactivate, setDeactivate] = useState(false);
    useEffect(() => {
        if (state.ok) {
            handleDeactivate();
            setDeactivate(false);
        }
    }, [state]);



    const bookingCount = bookings.length > 0
        ? bookings.filter(b => b.date === template.date).length
        : 0;

    return (
        <div className="border-2">
            <p>{template.day[0].toUpperCase() + template.day.slice(1)}</p>
            <p>
                {template.month_name[0].toUpperCase() + template.month_name.slice(1)} {template.date < 10 ? "0" + template.date : template.date}
            </p>
            <p>Status: {template.status === 0 ? "Inactive" : "Active"}</p>
            <p>Clinic: {minutesToMeridiem(template.start_time, true)} - {minutesToMeridiem(template.end_time, true)}</p>
            <p>Break: {minutesToMeridiem(template.break_start, true)} - {minutesToMeridiem(template.break_end, true)}</p>
            <p>Buffer: {template.buffer_minutes} Minutes</p>
            <p>Bookings: {bookingCount}</p>

            <Link href={`/edit-weekly-template/${template.public_id}/`}>Edit</Link>

            {template.status === 1 && <button onClick={() => setDeactivate(true)}>Deactivate</button>}
            {template.status === 0 && <>
                <Form action={action}>
                    <input type="hidden" name="public_id" value={template.public_id} />
                    <button type="submit">Activate</button>
                </Form>
            </>}

            {deactivate && (
                <div >
                    {bookingCount > 0 && <p>There are {bookingCount} bookings for this template. Patients will be notied to book again.</p>}
                    <Form action={action}>
                        <p>Are you sure?</p>
                        <input type="hidden" name="public_id" value={template.public_id} />
                        <button type="submit">Yes</button>
                        <button type="button" onClick={() => setDeactivate(false)}>Cancel</button>
                    </Form>
                </div>
            )}
        </div>
    );
}

```

---

## src\app\manage-weekly-template\[publicId]\deactivateSA.js

```
"use server";

import { db } from "../../lib/turso";

export async function toggleTemplateStatusServerAction(_, formData) {
    try {
        const templatePubId = formData.get("public_id");

        const fetchTemplate = await db.execute("SELECT * FROM weekly_template WHERE public_id = ?", [templatePubId]);
        if (fetchTemplate.rows.length === 0) return { ok: false, message: "Template not found" };

        const templateId = fetchTemplate.rows[0].id;
        const currentStatus = fetchTemplate.rows[0].status;
        const newStatus = currentStatus === 1 ? 0 : 1;
        await db.execute("UPDATE weekly_template SET status = ? WHERE id = ?", [newStatus, templateId]);





        return { ok: true, message: `Slot ${newStatus === 1 ? "activated" : "deactivated"}` }
    } catch (error) {
        console.error(error);
        return { ok: false, message: `Something went wrong while ${newStatus === 1 ? "activating" : "deactivating"}` }
    }
}
```

---

## src\app\manage-weekly-template\[publicId]\page.jsx

```
import { db } from "../../lib/turso";
import Link from "next/link";

import Client from "./Client";

export default async function ManageWeeklyTemplate({ params }) {

    const { publicId } = await params;

    const d = new Date();
    const currentMonthNumber = d.getMonth();
    const year = d.getFullYear();

    const fetchDocId = await db.execute("SELECT id FROM doctors WHERE public_id = ?", [publicId]);

    if (fetchDocId.rows.length === 0) return <div>Doctor not found</div>;

    const doctorId = fetchDocId.rows[0].id;

    const fetchTemplates = await db.execute(`SELECT * FROM weekly_template WHERE doctor_id = ? AND month_number = ? AND year = ?`, [doctorId, currentMonthNumber, year]);
    const templates = fetchTemplates.rows;
    const allDaysFromDb = fetchTemplates.rows?.map(row => row.day);
    const uniqueDaysFromDb = [...new Set(allDaysFromDb)];

    const fetchBookings = await db.execute(`SELECT * FROM bookings WHERE month_number = ?`, [currentMonthNumber]);
    const bookings = fetchBookings.rows;

    const allWeekDays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const nonTemplateDays = allWeekDays.filter(fn => !uniqueDaysFromDb.includes(fn.toLowerCase()));


    const bookingsArr = [];
    if (bookings.length > 0) {
        for (let booking of bookings) {
            bookingsArr.push({ date: booking.date });
        }
    }

    const templatesForClient = [];
    if (templates.length > 0) {
        for (let template of templates) {
            templatesForClient.push({
                public_id: template.public_id,
                status: template.status,
                day: template.day,
                day_number: template.day_number,
                month_name: template.month_name,
                month_number: template.month_number,
                year: template.year,
                date: template.date,
                start_time: template.start_time,
                end_time: template.end_time,
                break_start: template.break_start,
                break_end: template.break_end,
                buffer_minutes: template.buffer_minutes
            });
        }
    }


    //console.log("i am templates ", templates);

    return (
        <>
            {nonTemplateDays.length > 0 &&
                nonTemplateDays.map(day =>
                    <div key={day}>{day}
                        <Link href={`/manage-weekly-template/${publicId}/${day}`}>Add</Link>
                    </div>
                )}

            <Client templates={templatesForClient} publicId={publicId} bookings={bookingsArr} />
        </>
    );
}





```

---

## src\app\manage-weekly-template\[publicId]\[dayName]\daySA.js

```
"use server";

import { nanoid } from "nanoid";
import { initDoctorsTable, initWeeklyTemplateTable } from "../../../models/initiTables";
import { redirect } from "next/navigation";
import { db } from "../../../lib/turso";


function getMinutes(hr, min, meridiem) {
    let h = Number(hr);
    const m = Number(min);
    if (meridiem === "PM" && h !== 12) h += 12;
    if (meridiem === "AM" && h === 12) h = 0;
    return (h * 60) + m;
}

export async function dayServerAction(formData) {

    const daysCode = [
        { day: "Sunday", code: 0 },
        { day: "Monday", code: 1 },
        { day: "Tuesday", code: 2 },
        { day: "Wednesday", code: 3 },
        { day: "Thursday", code: 4 },
        { day: "Friday", code: 5 },
        { day: "Saturday", code: 6 }
    ];

    const monthCode = [
        { month: "January", code: 0 },
        { month: "February", code: 1 },
        { month: "March", code: 2 },
        { month: "April", code: 3 },
        { month: "May", code: 4 },
        { month: "June", code: 5 },
        { month: "July", code: 6 },
        { month: "August", code: 7 },
        { month: "September", code: 8 },
        { month: "October", code: 9 },
        { month: "November", code: 10 },
        { month: "December", code: 11 }
    ]

    const d = new Date();
    const currentMonthNumber = d.getMonth();
    const currentMonthName = monthCode.find((mn) => mn.code === currentMonthNumber).month?.toLowerCase();
    const date = d.getDate();
    const nextMonthNumber = currentMonthNumber + 1;
    const currentYear = d.getFullYear();
    const currentMonthNumberOfDays = new Date(currentYear, nextMonthNumber, 0).getDate();



    const docPubId = formData.get("doctorPublicId");
    const dayFromUser = formData.get("day")?.toLowerCase();
    const dayNumber = daysCode.find((fn) => fn.day.toLowerCase() === dayFromUser).code;
    const buffer = Number(formData.get("buffer"));
    const startInMinutes =
        getMinutes(formData.get("startHr"), formData.get("startMin"), formData.get("startMeridiem"));
    const endInMinutes =
        getMinutes(formData.get("endHr"), formData.get("endMin"), formData.get("endMeridiem"));
    const breakStartInMinutes =
        getMinutes(formData.get("breakStartHr"), formData.get("breakStartMin"), formData.get("breakStartMeridiem"));
    const breakEndInMinutes =
        getMinutes(formData.get("breakEndHr"), formData.get("breakEndMin"), formData.get("breakEndMeridiem"));

    const fetchDoctorId = await db.execute("SELECT id, department FROM doctors WHERE public_id = ?", [docPubId]);
    if (fetchDoctorId.rows.length === 0) return { ok: false, message: "Doctor not found" };
    const doctorId = fetchDoctorId.rows[0].id;


    const templatesArr = [];

    for (let i = date; i <= currentMonthNumberOfDays; i++) {
        const publicIdAtPeriod = nanoid(12);
        const dayNumberAtPeriod = new Date(currentYear, currentMonthNumber, i).getDay();
        const dayNameAtPeriod = daysCode.find(fn => fn.code === dayNumberAtPeriod).day?.toLowerCase();
        if (dayNameAtPeriod === dayFromUser && dayNumberAtPeriod === dayNumber) templatesArr.push(
            {
                publicIdAtPeriod,
                status: 1,
                dateAtPeriod: i,
                currentMonthNumber,
                currentMonthName,
                currentYear,
                dayNumberAtPeriod,
                dayNameAtPeriod,
                doctorId,
                buffer,
                startInMinutes,
                endInMinutes,
                breakStartInMinutes,
                breakEndInMinutes
            });
    };

    const columns = `public_id, status, doctor_id, day, day_number, month_name, month_number, year, date, start_time, end_time, break_start, break_end, buffer_minutes`;

    const placeHolder = templatesArr.map(() => `(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ? )`).join(", ");
    const values = templatesArr.flatMap(template => [
        template.publicIdAtPeriod,
        template.status,
        template.doctorId,
        template.dayNameAtPeriod,
        template.dayNumberAtPeriod,
        template.currentMonthName,
        template.currentMonthNumber,
        template.currentYear,
        template.dateAtPeriod,
        template.startInMinutes,
        template.endInMinutes,
        template.breakStartInMinutes,
        template.breakEndInMinutes,
        template.buffer,
    ]);

    const insertQuery = `INSERT INTO weekly_template (${columns}) VALUES ${placeHolder};`;

    try {
        await db.execute(insertQuery, values);
    } catch (error) {
        console.error(error);
        return { ok: false, message: "Database operation failed" };
    }

    redirect(`/manage-weekly-template/${docPubId}`);
}






export async function createWeeklyTemplateServerAction(_, formData) {
    try {
        await initDoctorsTable();
        await initWeeklyTemplateTable();

        const drPublicId = formData.get("doctorPublicId");
        const d = new Date();
        const currentMonthNumber = d.getMonth();

        const fetchDr = await db.execute("SELECT * FROM doctors WHERE public_id = ?", [drPublicId]);
        if (fetchDr.rows.length === 0) return { ok: false, searchComplete: true, message: "Doctor not found" };

        const doctorId = fetchDr.rows[0].id;
        const doctorName = fetchDr.rows[0].name;

        const fetchSlots = await db.execute("SELECT * FROM weekly_template WHERE doctor_id = ? AND month_number = ?", [doctorId, currentMonthNumber]);

        const data = [];

        if (fetchSlots.rows.length > 0) {
            for (let i = 0; i < fetchSlots.rows.length; i++) {
                const slot = fetchSlots.rows[i];
                data.push({
                    public_id: slot.public_id,
                    status: slot.status,
                    doctorName,
                    day: slot.day,
                    day_number: slot.day_number,
                    monthName: slot.month_name,
                    start_time: slot.start_time,
                    end_time: slot.end_time,
                    break_start: slot.break_start,
                    break_end: slot.break_end,
                    buffer_minutes: slot.buffer_minutes,
                    date: slot.date,
                });
            }
        }

        console.log("i reached here------------------------------>", data);

        return { ok: true, searchComplete: true, data, message: "Weekly templates found" };
    } catch (error) {
        console.error(error);
        return { ok: false, searchComplete: true, message: "Database operation failed" };
    }
}
```

---

## src\app\manage-weekly-template\[publicId]\[dayName]\page.jsx

```
import Form from "next/form";
import { dayServerAction } from "./daySA";

export default async function EditDaySlots({ params }) {
    const { dayName, publicId } = await params;

    let defaultBuffer = 10;

    let defaultStartHr = "09";
    let defaultStartMin = "00";
    let defaultStartMeridiem = "AM";

    let defaultEndHr = "05";
    let defaultEndMin = "00";
    let defaultEndMeridiem = "PM";

    let defaultBreakStartHr = "12";
    let defaultBreakStartMin = "00";
    let defaultBreakStartMeridiem = "PM";

    let defaultBreakEndHr = "01";
    let defaultBreakEndMin = "00";
    let defaultBreakEndMeridiem = "PM";





    const dummyHrs = [];
    for (let i = 1; i <= 12; i++) {
        if (i < 10) dummyHrs.push("0" + i);
        else dummyHrs.push(String(i));
    }

    const dummyMinutes = [];
    for (let i = 0; i <= 59; i++) {
        if (i < 10) dummyMinutes.push("0" + i);
        else dummyMinutes.push(String(i));
    }

    const meridiem = ["AM", "PM"];



    return (<>
        <h2>{dayName}</h2>
        <Form action={dayServerAction} className="space-y-6 p-6 bg-gray-50 dark:bg-gray-900 rounded-md">
            <input type="hidden" name="doctorPublicId" value={publicId} />
            <input type="hidden" name="day" value={dayName} />
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                Buffer in minutes
            </label>
            <input defaultValue={defaultBuffer} type="number" name="buffer" placeholder="Buffer in minutes" className="border border-gray-300 dark:border-gray-700 rounded-md px-3 py-2 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100" />

            <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                    Select Clinic Start time
                </label>
                <div className="flex gap-2 items-center">
                    <select
                        name="startHr"
                        className="border border-gray-300 dark:border-gray-700 rounded-md px-3 py-2 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100"
                        defaultValue={defaultStartHr}
                    >
                        {dummyHrs.map((hr) => (
                            <option value={hr} key={hr}>
                                {hr}
                            </option>
                        ))}
                    </select>
                    <select
                        name="startMin"
                        className="border border-gray-300 dark:border-gray-700 rounded-md px-3 py-2 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100"
                        defaultValue={defaultStartMin}
                    >
                        {dummyMinutes.map((min) => (
                            <option value={min} key={min}>
                                {min}
                            </option>
                        ))}
                    </select>
                    <select
                        defaultValue={defaultStartMeridiem}
                        name="startMeridiem"
                        className="border border-gray-300 dark:border-gray-700 rounded-md px-3 py-2 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100"
                    >
                        {meridiem.map((mer) => (
                            <option value={mer} key={mer}>
                                {mer}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                    Select Clinic End time
                </label>
                <div className="flex gap-2 items-center">
                    <select
                        defaultValue={defaultEndHr}
                        name="endHr"
                        className="border border-gray-300 dark:border-gray-700 rounded-md px-3 py-2 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100"
                    >
                        {dummyHrs.map((hr) => (
                            <option value={hr} key={hr}>
                                {hr}
                            </option>
                        ))}
                    </select>
                    <select
                        defaultValue={defaultEndMin}
                        name="endMin"
                        className="border border-gray-300 dark:border-gray-700 rounded-md px-3 py-2 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100"
                    >
                        {dummyMinutes.map((min) => (
                            <option value={min} key={min}>
                                {min}
                            </option>
                        ))}
                    </select>
                    <select
                        defaultValue={defaultEndMeridiem}
                        name="endMeridiem"
                        className="border border-gray-300 dark:border-gray-700 rounded-md px-3 py-2 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100"
                    >
                        {meridiem.map((mer) => (
                            <option value={mer} key={mer}>
                                {mer}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Break Start</label>
                    <div className="flex gap-2 items-center">
                        <select
                            defaultValue={defaultBreakStartHr}
                            name="breakStartHr"
                            className="border border-gray-300 dark:border-gray-700 rounded-md px-3 py-2 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100"
                        >
                            {dummyHrs.map((hr) => (
                                <option value={hr} key={hr}>
                                    {hr}
                                </option>
                            ))}
                        </select>
                        <select
                            defaultValue={defaultBreakStartMin}
                            name="breakStartMin"
                            className="border border-gray-300 dark:border-gray-700 rounded-md px-3 py-2 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100"
                        >
                            {dummyMinutes.map((min) => (
                                <option value={min} key={min}>
                                    {min}
                                </option>
                            ))}
                        </select>
                        <select
                            defaultValue={defaultBreakStartMeridiem}
                            name="breakStartMeridiem"
                            className="border border-gray-300 dark:border-gray-700 rounded-md px-3 py-2 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100"
                        >
                            {meridiem.map((mer) => (
                                <option value={mer} key={mer}>
                                    {mer}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Break End</label>
                    <div className="flex gap-2 items-center">
                        <select
                            defaultValue={defaultBreakEndHr}
                            name="breakEndHr"
                            className="border border-gray-300 dark:border-gray-700 rounded-md px-3 py-2 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100"
                        >
                            {dummyHrs.map((hr) => (
                                <option value={hr} key={hr}>
                                    {hr}
                                </option>
                            ))}
                        </select>
                        <select
                            defaultValue={defaultBreakEndMin}
                            name="breakEndMin"
                            className="border border-gray-300 dark:border-gray-700 rounded-md px-3 py-2 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100"
                        >
                            {dummyMinutes.map((min) => (
                                <option value={min} key={min}>
                                    {min}
                                </option>
                            ))}
                        </select>
                        <select
                            defaultValue={defaultBreakEndMeridiem}
                            name="breakEndMeridiem"
                            className="border border-gray-300 dark:border-gray-700 rounded-md px-3 py-2 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100"
                        >
                            {meridiem.map((mer) => (
                                <option value={mer} key={mer}>
                                    {mer}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            <div>
                <button
                    type="submit"
                    className="mt-2 inline-flex items-center justify-center rounded-md bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 px-4 py-2 text-sm font-semibold text-white focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                >
                    Submit
                </button>
            </div>
        </Form>
    </>);
}
```

---

## src\app\models\initiTables.js

```
"use server";

import { db } from "../lib/turso";

export async function initBookingsTable() {
  try {
    await db.execute(`
          CREATE TABLE IF NOT EXISTS bookings (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          public_id TEXT,
          doctor_id INTEGER,
          doctor_name TEXT,
          patient_name TEXT,
          patient_email TEXT,
          patient_phone TEXT,
          treatment_type TEXT,
          treatment_start INTEGER,
          treatment_end INTEGER,
          date INTEGER,
          month_name TEXT,
          month_number INTEGER,
          year INTEGER,
          day_name TEXT,
          day_number INTEGER,
          booking_registered_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          status TEXT DEFAULT 'pending',
          FOREIGN KEY (doctor_id) REFERENCES doctors(id) ON DELETE SET NULL
          )`
    );

    return { ok: true, message: "bookings table created" }

  } catch (error) {
    console.log(error);
    return { ok: false, message: error.message }
  }
};

export async function initWeeklyTemplateTable() {
  try {
    await db.execute(`
        CREATE TABLE IF NOT EXISTS weekly_template (
        id INTEGER PRIMARY KEY,
        public_id TEXT,
        status INTEGER DEFAULT 1,
        doctor_id INTEGER,
        day TEXT,
        day_number INTEGER DEFAULT 1,
        month_name TEXT DEFAULT 'January',
        month_number INTEGER DEFAULT 1,
        year INTEGER DEFAULT 2025,
        date INTEGER DEFAULT 1,
        start_time INTEGER DEFAULT 540,
        end_time INTEGER DEFAULT 1020,
        break_start INTEGER DEFAULT 720,
        break_end INTEGER DEFAULT 780,
        buffer_minutes INTEGER DEFAULT 10,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE (doctor_id, date, month_number, year),
        FOREIGN KEY (doctor_id) REFERENCES doctors(id) ON DELETE CASCADE
        )`
    );



    return { ok: true, message: "weekly_template table created" }
  } catch (error) {
    console.log(error);
    return { ok: false, message: error.message }
  }
};



export async function initDoctorsTable() {
  try {
    await db.execute(`
        CREATE TABLE IF NOT EXISTS doctors (
        id INTEGER PRIMARY KEY,
        public_id TEXT,
        department TEXT,
        name TEXT,
        title TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`
    );



    return { ok: true, message: "doctors table created" }
  } catch (error) {
    console.log(error);
    return { ok: false, message: error.message }
  }
}
```

---

## src\app\utils\minutes-to-meridiem.js

```


export function minutesToMeridiem(totalMinutes = 0, fullString = false) {

    const hrs24 = Math.floor(totalMinutes / 60);
    const mins = totalMinutes % 60;

    const meridiem = hrs24 >= 12 ? "PM" : "AM";

    let hrs12 = hrs24 % 12;
    if (hrs12 === 0) hrs12 = 12;

    const hrsStr = hrs12 < 10 ? "0" + hrs12 : String(hrs12);
    const minsStr = mins < 10 ? "0" + mins : String(mins);

    const time = {
        full: `${hrsStr}:${minsStr} ${meridiem}`,
        hrs: hrsStr,
        mins: minsStr,
        meridiem
    };

    return fullString ? time.full : time;


    

}
```

---

