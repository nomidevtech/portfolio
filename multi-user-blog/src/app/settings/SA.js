"use server";

import { getUser } from "../lib/getUser";
import { emailOrchestrator } from "../lib/resend";
import { db } from "../lib/turso";



export async function updateUserSA(_, formData) {
    const ppid = formData.get("ppid");
    const name = formData.get("name");
    const username = formData.get("username");
    const email = formData.get("email");


    if (!name || !username || !email) {
        return { ok: false, message: "All fields are required." };
    }

    try {

        const fetchUser = await db.execute(`SELECT * FROM users WHERE public_id = ?`, [ppid]);
        if (fetchUser.rows.length === 0) {
            return { ok: false, message: "User not found." };
        }

        const currentUser = await getUser();
        if (!currentUser?.id || currentUser?.id !== fetchUser.rows[0].id) {
            return { ok: false, message: "You are not authorized to update this user's profile." };
        }

        if (name === currentUser?.name && username === currentUser?.username && email === currentUser?.email) {
            return { ok: false, message: "Nothing to update." };
        }

        let resultUpdate = null;

        if (email !== currentUser?.email) {
            resultUpdate = await db.execute(`
            UPDATE users
            SET name = ?, username = ?, email = ?, email_verified = 0
            WHERE id = ?
        `, [name, username, email, currentUser?.id]);
            await emailOrchestrator(currentUser?.public_id, email);
        }
        else {
            resultUpdate = await db.execute(`
            UPDATE users
            SET name = ?, username = ?
            WHERE id = ?
        `, [name, username, currentUser?.id]);

        }


        if (resultUpdate.rowsAffected === 0) {
            return { ok: false, message: "Something went wrong. Please try again." };
        }



        return { ok: true, message: "Profile updated successfully." };

    } catch (error) {
        console.error("Update failed:", error);
        return { success: false, message: "Something went wrong. Please try again." };
    }
}
