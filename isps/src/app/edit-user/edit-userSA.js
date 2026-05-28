"use server";

import { getUser } from "../lib/getUser";
import { db } from "../lib/turso";
import {
  normalizeUsername,
  validateUsername,
  validateOptionalPassword,
} from "@/app/utils/validation";
import { redisIpLimit } from "@/app/utils/redidIpLimit";

export async function searchUser(_, searchTerm) {
    const term = searchTerm?.toString().trim();

    if (!term || term.length < 2) {
        return {
            ok: false,
            searchComplete: false,
            arr: [],
            message: "Enter at least 2 characters",
        };
    }
    try {
        const currentUser = await getUser();
        if (!currentUser?.id) return { ok: false, searchComplete: false, arr: [], message: "You must be logged in" };

        const adminId = currentUser.id;

        const fetch = await db.execute(`
        SELECT public_id, username
        FROM users
        WHERE admin_id = ? AND username LIKE ?
        LIMIT 5
        `, [adminId, `%${term}%`]);

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

        const fetchUser = await db.execute(`SELECT * FROM users WHERE admin_id = ? AND public_id = ? AND username = ?`, [adminId, userPublicId, username]);

        if (fetchUser.rows.length === 0) return { ok: false, message: "User details conflict" };

        const user = fetchUser.rows[0];
        const planId = user.plan_id;

        let planPublicId = "";
        let speed = 2;
        let fee = 500;

        if (planId) {
            const fetchPlan = await db.execute(
                `SELECT * FROM plans WHERE id = ? AND admin_id = ?`,
                [planId, adminId]
            );

            if (fetchPlan.rows.length > 0) {
                planPublicId = fetchPlan.rows[0].public_id;
                speed = fetchPlan.rows[0].speed;
                fee = fetchPlan.rows[0].rate;
            }
        }

        const userProperties = {
            public_id: user.public_id,
            username: user.username,
            password: user.password,
            contact: user.contact,
            plan_public_id: planPublicId,
            speed,
            fee,
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

        const ipLimit = await redisIpLimit(15, "edit_user");
        if (!ipLimit.ok) return ipLimit;

        const userPublicId = formData.get("user_public_id")?.toString().trim();
        const contactRaw = formData.get("contact")?.toString().trim();

        if (!userPublicId) return { ok: false, message: "Search term is broken" };

        let contact = 0;
        if (contactRaw) {
            contact = Number(contactRaw);
            if (!Number.isFinite(contact) || contact <= 0) {
                return { ok: false, searchComplete: false, message: "Contact must be a valid number" };
            }
        }
        const fetchUserId = await db.execute(`SELECT id, username, plan_id FROM users WHERE public_id = ? AND admin_id = ?`, [userPublicId, adminId]);

        if (fetchUserId.rows.length === 0) return { ok: false, searchComplete: false, message: "User details conflict" };

        const userId = fetchUserId.rows[0].id;
        const currentUsername = fetchUserId.rows[0].username;
        const currentPlanId = fetchUserId.rows[0].plan_id;

        const newUsername = normalizeUsername(formData.get("new_username")) || currentUsername;

        const passwordRaw = formData.get("password");
        const password = passwordRaw === null ? null : passwordRaw.toString();

        const usernameError = validateUsername(newUsername);
        if (usernameError) {
            return { ok: false, searchComplete: false, message: usernameError };
        }

        const passwordError = validateOptionalPassword(password, "Password");
        if (passwordError) {
            return { ok: false, searchComplete: false, message: passwordError };
        }

        const finalPassword = password || null;

        const newPlanPublicId = formData.get("new_plan_public_id")?.toString().trim();

        let planIdToSave = currentPlanId ?? null;

        if (newPlanPublicId) {
            const fetchPlan = await db.execute(
                `SELECT id FROM plans WHERE public_id = ? AND admin_id = ?`,
                [newPlanPublicId, adminId]
            );

            if (fetchPlan.rows.length === 0) {
                return { ok: false, searchComplete: false, message: "Select a valid plan" };
            }

            planIdToSave = fetchPlan.rows[0].id;
        }

        await db.execute(`UPDATE users SET username = ?, password = ?, contact = ?, plan_id = ? WHERE id = ? AND admin_id = ?`, [newUsername, finalPassword, contact, planIdToSave, userId, adminId]);

        return { ok: true, searchComplete: true, message: "User updated successfully" };
    } catch (error) {
        console.error(error);
        if (error.message && error.message.includes("UNIQUE")) {
            return {
                ok: false,
                searchComplete: false,
                message: "Username already exists",
            };
        }
        return { ok: false, searchComplete: false, message: "Database error." };
    }
}

export async function removeUser(_, formData) {
    try {
        const currentUser = await getUser();
        if (!currentUser?.id) return { ok: false, message: "You must be logged in" };

        const adminId = currentUser.id;

        const ipLimit = await redisIpLimit(10, "remove_user");
        if (!ipLimit.ok) return ipLimit;

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