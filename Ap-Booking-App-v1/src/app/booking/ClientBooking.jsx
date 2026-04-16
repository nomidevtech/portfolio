'use client';

import { useState } from "react";
import { minutesToMeridiem } from "../utils/minutes-to-meridiem";
import Form from "next/form";
import { bookingServerAction } from "./bookingSA";

export default function ClientBooking({ currentMonthSlots, monthName }) {

    let treatmentTime = 30;
    let treatmentType = "treatmentPlaceholder";

    const [userSlot, setUserSlot] = useState(null);

    const enrichedSlots = currentMonthSlots.map(daySegment => {
        if (daySegment.status === "inactive") {
            return { ...daySegment, virtualSlotsForTreatment: [] };
        }

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
            <div>{monthName?? "dummy month"} Slots</div>
            {enrichedSlots.map((daySegment, index) => (
                <div key={daySegment.day_number + index}>
                    <div className={daySegment.status === "inactive" ? "text-red-900" : " text-green-400"} >
                        {daySegment.day} {daySegment.monthName} {daySegment.date > 9 ? String(daySegment.date) : "0" + daySegment.date}
                        {daySegment.status === "inactive" && <span className="text-red-900 mx-2">: No Slots Available</span>}
                    </div>
                    {daySegment.virtualSlotsForTreatment.map(slot => (
                        <button onClick={() => setUserSlot({ baseSlot: daySegment, selectedSlot: slot })} className="p-2 m-2 border-2" key={slot.start}>{minutesToMeridiem(slot.start, true)} - {minutesToMeridiem(slot.end, true)}
                        </button>)
                    )}
                </div>
            ))}
        </>}
        {userSlot && <button onClick={() => setUserSlot(null)} >Choose another slot</button>}
        {userSlot &&
            <>
                <Form action={bookingServerAction}>
                    <input type="hidden" name="slot" value={JSON.stringify(userSlot)} />
                    <input type="text" name="full_name" placeholder="Full Name" />
                    <input type="text" name="phone" placeholder="Phone" />
                    <input type="text" name="email" placeholder="Email" />
                    <input type="hidden" name="treatment" value={treatmentType} />
                    <button type="submit">Submit</button>
                </Form>
            </>}
    </>);
}