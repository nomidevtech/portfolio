"use server";

import { db } from "../lib/turso";
import { redirect } from "next/navigation";

export async function serverAction2(formData) {
    try {
        // -----------------------------
        // STEP 1: Read incoming data
        // -----------------------------
        const name = formData.get("name");
        const email = formData.get("email");
        const phone = formData.get("phone");

        const treatment = "general checkup"; // hardcoded for now
        const bookingSlot = JSON.parse(formData.get("slot"));

        console.log("BOOKING SLOT:", bookingSlot);

        // -----------------------------
        // STEP 2: Fetch base slots
        // -----------------------------
        const res = await db.execute(`SELECT * FROM slots;`);
        const row = res.rows[0];

        let baseSlots = JSON.parse(row.base_slot);

        console.log("BEFORE:", baseSlots);

        // -----------------------------
        // STEP 3: Apply buffer
        // -----------------------------
        const buffer = 10;

        const effectiveBooking = {
            start: bookingSlot.start,
            end: bookingSlot.end + buffer
        };

        console.log("EFFECTIVE BOOKING:", effectiveBooking);

        // -----------------------------
        // STEP 4: Build new base slots
        // -----------------------------
        let newBaseSlots = [];

        for (const segment of baseSlots) {

            console.log("SEGMENT:", segment);

            const overlap =
                effectiveBooking.start < segment.end &&
                effectiveBooking.end > segment.start;

            console.log("OVERLAP:", overlap);

            if (!overlap) {
                newBaseSlots.push(segment);
                continue;
            }

            // -------- LEFT PART --------
            if (effectiveBooking.start > segment.start) {
                const left = {
                    start: segment.start,
                    end: effectiveBooking.start
                };

                console.log("LEFT PUSH:", left);
                newBaseSlots.push(left);
            }

            // -------- RIGHT PART --------
            if (effectiveBooking.end < segment.end) {
                const right = {
                    start: effectiveBooking.end,
                    end: segment.end
                };

                console.log("RIGHT PUSH:", right);
                newBaseSlots.push(right);
            }
        }

        console.log("AFTER:", newBaseSlots);

        // -----------------------------
        // STEP 5: Save booking
        // -----------------------------
        const patient = {
            name,
            email,
            phone,
            treatment,
            bookingSlot
        };

        await db.execute(
            `INSERT INTO slots (booking_slots) VALUES (?)`,
            [JSON.stringify(patient)]
        );

        // -----------------------------
        // STEP 6: Update base slots
        // -----------------------------
        await db.execute(
            `UPDATE slots SET base_slot = ?`,
            [JSON.stringify(newBaseSlots)]
        );

    } catch (error) {
        console.log(error);
        return {
            ok: false,
            message: "something went wrong during booking"
        };
    }

    // -----------------------------
    // STEP 7: Refresh UI
    // -----------------------------
    redirect("/client2");
}