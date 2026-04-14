import { minutesToMeridiem } from "../utils/minutes-to-meridiem";

export default function ClientBooking({ currentMonthSlots, monthName }) {

    let treatmentTime = 30;



    const enrichedSlots = currentMonthSlots.map(daySegment => {
        if (daySegment.status === "inactive") {
            return { ...daySegment, virtualSlotsForTreatment: [] };
        }

        const slots = [];
        for (const slotSegment of daySegment.virtualSlotsBase) {
            let cursor = slotSegment.start;
            while (cursor + treatmentTime <= slotSegment.end) {
                slots.push({ start: cursor, end: cursor + treatmentTime });
                cursor = cursor + treatmentTime + daySegment.buffer_minutes;
            }
        }
        return { ...daySegment, virtualSlotsForTreatment: slots };
    });

    console.dir(enrichedSlots, { depth: null });



    return (<>
        <div>{monthName} Slots</div>
        {enrichedSlots.map((daySegment, index) => (
            <div key={daySegment.day_number + index}>
                <div className={daySegment.status === "inactive" ? "text-red-900" : " text-green-400"} >
                    {daySegment.day}: {daySegment.date > 9 ? String(daySegment.date) : "0" + daySegment.date}
                </div>
                {daySegment.virtualSlotsForTreatment.map(slot => (
                    <button className="p-2 m-2 border-2" key={slot.start}>{minutesToMeridiem(slot.start, true)} - {minutesToMeridiem(slot.end, true)}
                    </button>)
                )}
            </div>
        ))}
    </>);
}