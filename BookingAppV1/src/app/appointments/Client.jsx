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
        {dateKeys.length === 0 && <button onClick={handleAllBookings}>Show All Appointments ⬅</button>}
        {fullCache && <button onClick={() => {
            setDateKeys(dateKeysFromParent);
            setDocArr(docArrFromParent);
        }}>Show Verified Appointments ⬅</button>}
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
                <button onClick={() => setMark(!mark)}>{mark ? "Back" : "Cancel Appointments on This Day ⬅"}</button>
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
                <h2>Dr. {meta.name} — {meta.department}</h2>
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
            <button onClick={() => setMark(!mark)}>{mark ? "Back" : "Cancel Booking ⬅"}</button>
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