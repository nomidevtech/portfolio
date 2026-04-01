"use server";

import { db } from "../lib/turso";

export async function searchUser(_, searchTerm) {
    if (!searchTerm) return { ok: false, searchComplete: false, arr: [], message: "Search term is required" };
    try {

        const fetch = await db.execute(`
        SELECT public_id, username
        FROM users
        WHERE username LIKE ?
        LIMIT 5
        `, [`%${searchTerm}%`]);

        if (fetch.rows.length === 0) return { ok: false, searchComplete: true, arr: [], message: "No user found" };

        const arr = fetch.rows.map(user => ({
            public_id: user.public_id,
            username: user.username
        }));

        return { ok: true, searchComplete: true, arr, message: "Search completed" };

    } catch (error) {
        console.error(error);
        return { ok: false, searchComplete: false, arr: [], message: "Database error." };
    }

}







export async function fetchUserData(_, formData) {
    try {

        const userPublicId = formData.get("user_public_id")?.toString().trim();
        const username = formData.get("username")?.toString().trim();

        if (!userPublicId || !username) return { ok: false, message: "Search term is broken" };

        const fetchUserId = await db.execute(`SELECT * FROM users WHERE public_id = ? AND username = ?`, [userPublicId, username]);

        if (fetchUserId.rows.length === 0) return { ok: false, message: "User details conflict" };

        const user = fetchUserId.rows[0];

        const userProperties = {
            public_id: user.public_id,
            username: user.username,
            password: user.password,
            contact: user.contact,
        };

        return { ok: true, searchComplete: true, user: userProperties, message: "Search completed" };
    } catch (error) {
        console.error(error);
        return { ok: false, searchComplete: false, user: {}, message: "Database error." };
    }
}




export async function updateUser(_, formData) {
    try {

        const userPublicId = formData.get("user_public_id")?.toString().trim();
        const username = formData.get("username")?.toString().trim();
        const newUsername = formData.get("new_username")?.toString().trim();
        const password = formData.get("password")?.toString().trim() || null;
        const contactRaw = formData.get("contact")?.toString().trim();
        const contact = contactRaw ? Number(contactRaw) : 0;

        console.log("userPublicId", userPublicId);
        console.log("username", username);
        console.log("newUsername", newUsername);
        console.log("password", password);
        console.log("contact", contact);

        console.log("1<----------------------------------------------------------");

        if (!userPublicId || !username) return { ok: false, message: "Search term is broken" };

        console.log("2<----------------------------------------------------------");

        const fetchUserId = await db.execute(`SELECT id FROM users WHERE public_id = ? AND username = ?`, [userPublicId, username]);
        console.log("3<----------------------------------------------------------", fetchUserId);

        if (fetchUserId.rows.length === 0) return { ok: false, searchComplete: false, message: "User details conflict" };
        console.log("4<----------------------------------------------------------");

        const userId = fetchUserId.rows[0].id;

        console.log(userId, "<----------------------------------------------------------");

        await db.execute(`UPDATE users SET username = ?, password = ?, contact = ? WHERE id = ?`, [newUsername, password, contact, userId]);

        return { ok: true, searchComplete: true, message: "User updated successfully" };
    } catch (error) {
        console.error(error);
        return { ok: false, searchComplete: false, message: "Database error." };
    }
}