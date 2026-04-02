"use server";


import { getUser } from "../lib/getUser";
import { db } from "../lib/turso";

export async function searchUser(_, searchTerm) {
    if (!searchTerm) return { ok: false, searchComplete: false, arr: [], message: "Search term is required" };
    try {

        const currentUser = await getUser();
        if (!currentUser?.id) return { ok: false, searchComplete: false, arr: [], message: "You must be logged in" };

        const adminId = currentUser.id;

        const fetch = await db.execute(`
        SELECT public_id, username
        FROM users
        WHERE admin_id = ? AND username LIKE ?
        LIMIT 5
        `, [adminId, `%${searchTerm}%`]);

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

        const currentUser = await getUser();
        if (!currentUser?.id) return { ok: false, searchComplete: false, arr: [], message: "You must be logged in" };

        const adminId = currentUser.id;

        const userPublicId = formData.get("user_public_id")?.toString().trim();
        const username = formData.get("username")?.toString().trim();

        if (!userPublicId || !username) return { ok: false, message: "Search term is broken" };

        const fetchUser = await db.execute(`SELECT * FROM users WHERE public_id = ? AND username = ?`, [userPublicId, username]);

        if (fetchUser.rows.length === 0) return { ok: false, message: "User details conflict" };

        const user = fetchUser.rows[0];
        const plan_id = user.plan_id;

        const fetchPlan = await db.execute(`SELECT * FROM plans WHERE id = ? AND admin_id = ?`, [plan_id, adminId]);

        if (fetchPlan.rows.length === 0) return { ok: false, message: "Current user might not have a valid plan.Try again" };



        const userProperties = {
            public_id: user.public_id,
            username: user.username,
            password: user.password,
            contact: user.contact,
            plan_public_id: fetchPlan.rows[0].public_id,
            speed: fetchPlan.rows[0].speed,
            fee: fetchPlan.rows[0].rate
        };

        return { ok: true, searchComplete: true, user: userProperties, message: "Search completed" };
    } catch (error) {
        console.error(error);
        return { ok: false, searchComplete: false, user: {}, message: "Database error." };
    }
}




export async function updateUser(_, formData) {
    try {

        const currentUser = await getUser();
        if (!currentUser?.id) return { ok: false, searchComplete: false, arr: [], message: "You must be logged in" };

        const adminId = currentUser.id;

        const userPublicId = formData.get("user_public_id")?.toString().trim();
        const username = formData.get("username")?.toString().trim();
        const newUsername = formData.get("new_username")?.toString().trim();
        const password = formData.get("password")?.toString().trim() || null;
        const contactRaw = formData.get("contact")?.toString().trim();
        const contact = contactRaw ? Number(contactRaw) : 0;
        const oldPlanId = formData.get("old_plan_public_id")?.toString().trim();
        const newPlanId = formData.get("new_plan_public_id")?.toString().trim();



        if (!userPublicId || !username) return { ok: false, message: "Search term is broken" };


        const fetchUserId = await db.execute(`SELECT id FROM users WHERE public_id = ? AND admin_id = ? AND username = ?`, [userPublicId, adminId, username]);

        if (fetchUserId.rows.length === 0) return { ok: false, searchComplete: false, message: "User details conflict" };

        const userId = fetchUserId.rows[0].id;

        const fetchPlan = await db.execute(`SELECT * FROM plans WHERE public_id = ? AND admin_id = ?`, [newPlanId, adminId]);

        if (fetchPlan.rows.length === 0) return { ok: false, searchComplete: false, message: "Select a valid plan" };

        const planId = fetchPlan.rows[0].id;


        await db.execute(`UPDATE users SET username = ?, password = ?, contact = ?, plan_id = ? WHERE id = ? AND admin_id = ?`, [newUsername, password, contact, planId, userId, adminId]);

        return { ok: true, searchComplete: true, message: "User updated successfully" };
    } catch (error) {
        console.error(error);
        return { ok: false, searchComplete: false, message: "Database error." };
    }
}







export async function removeUser(_, formData) {
    try {

        const currentUser = await getUser();
        if (!currentUser?.id) return { ok: false, message: "You must be logged in" };

        const adminId = currentUser.id;

        const userPublicId = formData.get("user_public_id")?.toString().trim();


        if (!userPublicId) return { ok: false, message: "Search term is broken" };

        const fetchUserId = await db.execute(`SELECT id FROM users WHERE public_id = ? AND admin_id = ?`, [userPublicId, adminId]);

        if (fetchUserId.rows.length === 0) return { ok: false, message: "User details conflict" };

        const userId = fetchUserId.rows[0].id;

        await db.execute(`DELETE FROM users WHERE id = ? AND admin_id = ?`, [userId, adminId]);

        return { ok: true, message: "User removed successfully" };
    } catch (error) {
        console.error(error);
        return { ok: false, message: "Database error." };
    }
}