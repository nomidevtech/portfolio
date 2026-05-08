"use server";

import { nanoid } from "nanoid";
import { initSlotsTable } from "../Models/initTables";
import { db } from "./turso";


export async function rollingWindow(adminId = null, win = 31) {
    try {


        const fetchAllTemplates = adminId ?
            await db.execute("SELECT * FROM templates WHERE admin_id = ?", [adminId]) :
            await db.execute("SELECT * FROM templates");

        if (fetchAllTemplates.rows.length === 0) return null;

        const slotsArr = [];

        const d = new Date();
        for (let i = 0; i < win; i++) {

            const current = new Date(d);
            current.setDate(d.getDate() + i);

            const dateAtPeriod = current.getDate();
            const monthAtPeriod = current.getMonth();
            const yearAtPeriod = current.getFullYear();
            const dayNumAtPeriod = current.getDay();

            const fullDateAtPeriodInIso = current.toISOString().split("T")[0];

            const tempelateAtPediod = fetchAllTemplates.rows.filter(fn => fn.day_number === dayNumAtPeriod);

            const flatenTemplate = tempelateAtPediod.map(temp => ({
                ...temp,
                date_number: dateAtPeriod,
                month_number: monthAtPeriod,
                year: yearAtPeriod,
                slot_public_id: nanoid(12),
                status: "active",
                full_date_at_period: fullDateAtPeriodInIso,
            }));

            slotsArr.push(...flatenTemplate);
        }

        const slotsArrSorted = slotsArr.sort((a, b) =>
            a.year - b.year ||
            a.month_number - b.month_number ||
            a.date_number - b.date_number
        );

        const columns = `public_id, status, admin_id, doctor_id, day_number, month_number, year, date_number, start_time, end_time, break_start, break_end, buffer_minutes, full_date_at_period`;

        const placeHolder = slotsArrSorted.map(() => `(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ? )`).join(", ");
        const values = slotsArrSorted.flatMap(slot => [
            slot.slot_public_id,
            slot.status,
            slot.admin_id,
            slot.doctor_id,
            slot.day_number,
            slot.month_number,
            slot.year,
            slot.date_number,
            slot.start_time,
            slot.end_time,
            slot.break_start,
            slot.break_end,
            slot.buffer_minutes,
            slot.full_date_at_period,
        ]);

        await db.execute(
            `INSERT INTO slots (${columns}) VALUES ${placeHolder}
                    ON CONFLICT (admin_id, doctor_id, month_number, year, date_number)
                    DO NOTHING`,
            values
        );


        await db.execute(`DELETE FROM slots WHERE DATE(full_date_at_period) < DATE('now')`);

    } catch (error) {
        console.error(error);
        return null;
    }
}