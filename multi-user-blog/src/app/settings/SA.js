"use server";

import { getUser } from "../lib/getUser";
import { db } from "../lib/turso";



export async function updateUserSA(_, formData) {
    const name = formData.get("name");
    const username = formData.get("username");
    const email = formData.get("email");


    if (!name || !username || !email) {
        return { success: false, message: "All fields are required." };
    }

    const currentUser = await getUser();
    if (!currentUser) {
        return { success: false, message: "User not found." };
    }

    try {
        if (email !== currentUser.email) {
            await db.execute(`
            UPDATE users
            SET name = ?, username = ?, email = ?, email_verified = 0
            WHERE id = ?
        `, [name, username, email, currentUser?.id]);
        }
        else {
            await db.execute(`
            UPDATE users
            SET name = ?, username = ?, email = ?
            WHERE id = ?
        `, [name, username, email, currentUser?.id]);
        }


        return { success: true, message: "Profile updated successfully." };

    } catch (error) {
        console.error("Update failed:", error);
        return { success: false, message: "Something went wrong. Please try again." };
    }
}
