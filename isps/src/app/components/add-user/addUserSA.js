"use server";

import { db } from "@/app/lib/turso";
import { initAdminsTable, initUsersTable } from "@/app/models/table-inits";
import { nanoid } from "nanoid";


export async function addUserServerAction(_, formData) {
    try {
        const username = formData.get("username")?.toString().trim();
        const password = formData.get("password")?.toString().trim();
        const contactRaw = formData.get("contact")?.toString().trim();
        const contact = contactRaw ? parseInt(contactRaw) : null;
        if (!username) return { ok: false, message: "Username is required" };

        // const initUsersTableResult = await initAdminsTable();
        // const initConsumersTableResult = await initUsersTable();

        // if (!initUsersTableResult.ok) return { ok: false, message: "Error creating users table" };
        // if (!initConsumersTableResult.ok) return { ok: false, message: "Error creating consumers table" };


        // const insertAdminResult = await db.execute(`INSERT INTO admins (public_id, username) VALUES (?, ?) RETURNING id`, [nanoid(), 'faisal9mm']);

        const adminId = 1;



        const insertConsumerResult = await db.execute(`INSERT INTO users (public_id, admin_id, username, password, contact) VALUES (?, ?, ?, ?, ?)`, [nanoid(), adminId, username, password, contact]);






        return { ok: true, message: "User added successfully" };
    } catch (error) {
        console.error(error);
        return { ok: false, message: "Error adding user" };
    }
}