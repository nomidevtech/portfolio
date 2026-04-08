"use server";


import { initSlotTalbe } from "../models/initiTables";
import { db } from "../lib/turso";
import { redirect } from "next/navigation";

export async function serverAction2(formData) {
    try {
        let startHr = Number(formData.get("startHr"));
        let startMin = Number(formData.get("startMin"));
        let startMeridiem = formData.get("startMeridiem");

        let endHr = Number(formData.get("endHr"));
        let endMin = Number(formData.get("endMin"));
        let endMeridiem = formData.get("endMeridiem");

        let breakStartHr = Number(formData.get("breakStartHr"));
        let breakStartMin = Number(formData.get("breakStartMin"));
        let breakStartMeridiem = formData.get("breakStartMeridiem");

        let breakEndHr = Number(formData.get("breakEndHr"));
        let breakEndMin = Number(formData.get("breakEndMin"));
        let breakEndMeridiem = formData.get("breakEndMeridiem");

        if (startMeridiem === "PM" && startHr !== 12) startHr += 12;
        if (startMeridiem === "AM" && startHr === 12) startHr = 0;

        if (endMeridiem === "PM" && endHr !== 12) endHr += 12;
        if (endMeridiem === "AM" && endHr === 12) endHr = 0;

        if (breakStartMeridiem === "PM" && breakStartHr !== 12) breakStartHr += 12;
        if (breakStartMeridiem === "AM" && breakStartHr === 12) breakStartHr = 0;

        if (breakEndMeridiem === "PM" && breakEndHr !== 12) breakEndHr += 12;
        if (breakEndMeridiem === "AM" && breakEndHr === 12) breakEndHr = 0;

        let startInMinutes = (startHr * 60) + startMin;
        let endInMinutes = (endHr * 60) + endMin;
        let breakStartInMinutes = (breakStartHr * 60) + breakStartMin;
        let breakEndInMinutes = (breakEndHr * 60) + breakEndMin;

        console.log("startInMinutes", startInMinutes);
        console.log("endInMinutes", endInMinutes);
        console.log("breakStartInMinutes", breakStartInMinutes);
        console.log("breakEndInMinutes", breakEndInMinutes);


        const baseSlot = [
            {
                start: startInMinutes,
                end: breakStartInMinutes
            },
            {
                start: breakEndInMinutes,
                end: endInMinutes
            }
        ];



        console.log("baseSlot", baseSlot);

        await initSlotTalbe();

        await db.execute(
            `INSERT INTO slots (base_slot) VALUES(?)`,
            [JSON.stringify(baseSlot)]
        );





    } catch (error) {
        console.log(error);
        return { ok: false, message: "something went wrong during slot creation" }
    }
    redirect('/client2');
}