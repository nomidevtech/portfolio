'use client';
import { useState } from "react";
import Form from "next/form";
import { serverAction2 } from "./serverAction2";

export function Client2Child({ baseSlot = [], buffer = 0, rootCanal = 0, cavity = 0, generalCheck = 0 }) {

    const [formFill, setFormFill] = useState(null);

    let slots = [];

    let patientTreatment = generalCheck; // hardcoded for now

    for (const segment of baseSlot) {
        let newStart = segment.start;
        while (newStart + patientTreatment <= segment.end) {
            slots.push({ start: newStart, end: newStart + patientTreatment });
            newStart = newStart + patientTreatment + buffer;
        };
    };

    console.log(slots);



    const handleClick = (slot) => {
        console.log("---------------------------------------->", slot);
        setFormFill({ ok: true, slot });
    }





    return (<>
        {!formFill && (<>
            <div>
                {slots.map((slot) => {
                    const label = formatMinutes(slot.start);

                    return (
                        <button onClick={() => handleClick(slot)} key={slot.start} className="border-2 m-1">
                            {label}
                        </button>
                    );
                })}
            </div>

        </>)}

        {formFill && (<>
            <div>
                <p>Start: {formatMinutes(formFill.slot.start)}</p>
                <p>End: {formatMinutes(formFill.slot.end)}</p>
                <button onClick={() => setFormFill({ ok: false, slot: {} })}>Chose another</button>
            </div>
            <Form action={serverAction2}>
                <input type="text" placeholder="Enter your name" name="name" />
                <input type="text" placeholder="Enter your phone number" name="phone" />
                <input type="text" placeholder="Enter your email" name="email" />
                <input type="hidden" name="slot" value={JSON.stringify(formFill.slot)} />
                <button type="submit">Submit</button>

            </Form>

        </>)}



    </>);
}





function formatMinutes(totalMinutes = 0) {
    const hrs24 = Math.floor(totalMinutes / 60);
    const mins = totalMinutes % 60;

    const meridiem = hrs24 >= 12 ? "PM" : "AM";

    let hrs12 = hrs24 % 12;
    if (hrs12 === 0) hrs12 = 12;

    const minsStr = mins < 10 ? "0" + mins : String(mins);

    return `${hrs12}:${minsStr} ${meridiem}`;
}