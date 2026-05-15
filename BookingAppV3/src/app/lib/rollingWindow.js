// src/app/lib/rollingWindow.js
"use server";

import { nanoid } from "nanoid";
import { db } from "./turso";

export async function rollingWindow(adminId = null, win = 31) {
    try {
        // 1. Fetch templates
        const fetchAllTemplates = adminId
            ? await db.execute("SELECT * FROM weekly_templates WHERE admin_id = ?", [adminId])
            : await db.execute("SELECT * FROM weekly_templates");

        if (fetchAllTemplates.rows.length === 0) return null;

        const slotsArr = [];
        const d = new Date();

        for (let i = 0; i < win; i++) {
            const current = new Date(d);
            current.setDate(d.getDate() + i);

            const dateAtPeriod = current.getUTCDate();
            const monthAtPeriod = current.getUTCMonth();
            const yearAtPeriod = current.getUTCFullYear();
            const dayNumAtPeriod = current.getUTCDay();

            const yyyy = current.getUTCFullYear();
            const mm = String(current.getUTCMonth() + 1).padStart(2, '0');
            const dd = String(current.getUTCDate()).padStart(2, '0');
            const fullDateAtPeriodInIso = `${yyyy}-${mm}-${dd}`;

            const templateAtPeriod = fetchAllTemplates.rows.filter(
                (fn) => fn.day_number === dayNumAtPeriod
            );

            const flattenTemplate = templateAtPeriod.map((temp) => ({
                ...temp,
                date_number: dateAtPeriod,
                month_number: monthAtPeriod,
                year: yearAtPeriod,
                slot_public_id: nanoid(12),
                status: "active",
                full_date_at_period: fullDateAtPeriodInIso,
            }));

            slotsArr.push(...flattenTemplate);
        } // loop ends

        const slotsArrSorted = slotsArr.sort(
            (a, b) =>
                a.year - b.year ||
                a.month_number - b.month_number ||
                a.date_number - b.date_number
        );

        const columns = `
            public_id, status, admin_id, doctor_id, day_number, month_number, 
            year, date_number, start_time, end_time, break_start, break_end, 
            buffer_minutes, full_date_at_period
        `;

        const CHUNK_SIZE = 1000; 

        for (let i = 0; i < slotsArrSorted.length; i += CHUNK_SIZE) {
            const chunk = slotsArrSorted.slice(i, i + CHUNK_SIZE);

            const placeHolder = chunk
                .map(() => `(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
                .join(", ");

            const values = chunk.flatMap((slot) => [
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

            try {
                await db.execute(
                    `INSERT INTO slots (${columns})
                     VALUES ${placeHolder}
                     ON CONFLICT (admin_id, doctor_id, full_date_at_period)
                     DO NOTHING`,
                    values
                );
            } catch (chunkError) {
                console.error(`Failed to insert slot chunk starting at index ${i}:`, chunkError);
            }
        } // loop ends

        
        await db.execute(
            `DELETE FROM slots 
             WHERE DATE(full_date_at_period) < DATE('now')`
        );

    } catch (error) {
        console.error("Rolling Window Error:", error);
        return null;
    }
}