"use server";

import { redirect } from "next/navigation";
import { db } from "../lib/turso";
import { nanoid } from "nanoid";

export async function addDoctorServerAction(formData) {
    const new_doc_pub_id = nanoid(12);
    try {
        const adminId = 1; // hardcoded for now
        const name = formData.get("name");
        const department = formData.get("department");

        const treatmentString = formData.get("treatment");
        const treamentArr = treatmentString.split(' - ');
        const treamentName = treamentArr[0]?.trim().replace(/\s/g, "").toLowerCase();
        const treatmentDuration = Number(treamentArr[1]?.split("min")[0]?.trim());

        const fetchTreamnetId = await db.execute(`SELECT id FROM treatments WHERE name = ? AND duration = ?`, [treamentName, treatmentDuration]);

        if (fetchTreamnetId?.rows.length === 0) return null;

        const result = await db.execute(`INSERT INTO doctors (admin_id, name, department, public_id) VALUES (?, ?, ?, ?) RETURNING id`, [adminId, name.toLowerCase(), department.toLowerCase(), nanoid(12)]);

        const doctorId = result.rows[0].id;
        if (!doctorId) return null;


        await db.execute(`INSERT INTO doctor_treatments (public_id, admin_id, doctor_id, treatment_id) VALUES (?, ?, ?, ?)`, [new_doc_pub_id, adminId, doctorId, fetchTreamnetId.rows[0].id]);

    } catch (error) {
        console.error(error);
        return null;
    }
    redirect(`/edit-doctor/${new_doc_pub_id}`);
}