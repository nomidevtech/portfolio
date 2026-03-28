'use server';

import { db } from "@/app/lib/turso";
import { initBilling_transactionsTable } from "@/app/models/table-inits";



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


export async function fetchUserDetails(_, formData) {

    console.log('i am here -----------------> in fetchUserDetails');

    try {
        const userPId = formData.get('user_public_id');
        if (!userPId) return { ok: false, searchComplete: false, arr: [], message: "Query is required" };

        console.log('i am userid -----------------> ', userPId);

        await initBilling_transactionsTable();

        console.log('i am after init -----------------> ');

        const now = new Date();

        const startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);

        const start = startDate.toISOString();
        const end = endDate.toISOString();

        console.log('i am start -----------------> ', start);
        console.log('i am end -----------------> ', end);

        const userRes = await db.execute("SELECT username FROM users WHERE public_id = ?", [userPId]);
        if (!userRes.rows.length) return { ok: true, searchComplete: true, obj: {}, message: "No user found" };



        const user_username = userRes.rows[0].username;

        console.log('i am user_username -----------------> ', user_username);

        const res = await db.execute(
            "SELECT * FROM billing_transactions WHERE username_snapshot = ? AND entry_date >= ? AND entry_date < ?",
            [user_username, start, end]
        );

        console.log('i am res -----------------> ', res);

        if (!res.rows.length) {

            const fetchUserDetails = await db.execute(`
                SELECT 
                 plans.speed AS plan,
                 plans.rate AS rate,
                 users.contact AS contact,
                users.username AS username
                FROM users
                LEFT JOIN user_plans ON users.id = user_plans.user_id
                LEFT JOIN plans ON user_plans.plan_id = plans.id
                WHERE users.public_id = ? AND users.username = ?`,
                [userPId, user_username]);

            if (!fetchUserDetails.rows.length) {
                return {
                    ok: false,
                    searchComplete: true,
                    obj: {},
                    message: "something went wrong. User might not exist. Please add user or try again"
                };
            }
            console.log('i am fetchUserDetails =================> ', fetchUserDetails.rows[0]);

            return {
                ok: true,
                searchComplete: true,
                objSerialized: JSON.stringify(fetchUserDetails.rows[0]),
                message: "Search completed"
            };
        }

        return { ok: true, searchComplete: true, obj: res.rows[0], message: "Search completed" };
    } catch (error) {
        console.log(error);
        return { ok: false, searchComplete: false, arr: [], message: "Database error." };
    }
}



export async function submitAction(_, formData) {

    const userPId = formData?.get('userId');


    console.log('i am userid -----------------> ', userPId);


    if (!userPId) {
        return { ok: false, message: "Missing User selection" };
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