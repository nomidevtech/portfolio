'use server';

import { db } from "@/app/lib/turso";
import { initUserPlansTable } from "@/app/models/table-inits";


export async function searchUserAction(_, formData) {
    const query = formData;
    if (!query) return { ok: false, searchComplete: false, arr: [], message: "Query is required" };

    try {

        const res = await db.execute("SELECT public_id, username FROM users WHERE username LIKE ? LIMIT 5", [`%${query}%`]);

        if (res.rows.length === 0) {
            return { ok: true, searchComplete: true, arr: [], message: "No user found" };
        }

        const arr = res.rows.map(user => ({
            public_id: user.public_id,
            username: user.username
        }));

        return { ok: true, searchComplete: true, arr, message: "Search completed" };
    } catch (error) {
        return { ok: false, searchComplete: false, arr: [], message: "Database error." };
    }
}

export async function searchPlanAction(_, formData) {
    const query = formData;
    if (!query) return { ok: false, searchComplete: false, arr: [], message: "Query is required" };

    try {
        const res = await db.execute("SELECT public_id, speed  FROM plans WHERE speed LIKE ? LIMIT 5", [`%${Number(query)}%`]);

        if (res.rows.length === 0) {
            return { ok: true, searchComplete: true, arr: [], message: "No plan found" };
        }


        const arr = res.rows.map(plan => ({
            public_id: plan.public_id,
            speed: `${plan.speed} Mbps`
        }));

        return { ok: true, searchComplete: true, arr, message: "Search completed" };
    } catch (error) {
        return { ok: false, searchComplete: false, arr: [], message: "Database error." };
    }
}

export async function submitAction(_, formData) {

    console.log('i am formdata -----------------> ', formData);

    const userPId = formData?.get('userId');
    const planPId = formData?.get('planId');

    console.log('i am userid -----------------> ', userPId);
    console.log('i am planid -----------------> ', planPId);

    if (!userPId || !planPId) {
        return { ok: false, message: "Missing User or Plan selection" };
    }
    console.log('i am here before fetch -----------------> ');
    try {
        //const initUserPlanResult = await initUserPlansTable();

        const fetchUserId = await db.execute("SELECT id FROM users WHERE public_id = ?", [userPId]);
        const fetchPlanId = await db.execute("SELECT id FROM plans WHERE public_id = ?", [planPId]);

        console.log('i am here after fetch -----------------> ');

        const userId = fetchUserId?.rows[0]?.id;
        const planId = fetchPlanId?.rows[0]?.id;

        console.log('i am userid -----------------> ', userId);
        console.log('i am planid -----------------> ', planId);

        let result;

        if (userId && planId) {
            result = await db.execute("INSERT INTO user_plans (user_id, plan_id) VALUES (?, ?)", [userId, planId]);
        }

        if (result.rowsAffected === 0) {
            return { ok: false, message: "Error updating user plan" };
        }

        return { ok: true, message: "User plan updated successfully" };
    } catch (error) {
        return { ok: false, message: "Database error." };
    }
}