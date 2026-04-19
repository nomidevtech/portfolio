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