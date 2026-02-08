'use server'

import { db } from "./turso";



const userVerification = async (name) => {

    try {

        const result = (await db.execute(`SELECT * FROM users WHERE username = ?`, [name])).rows[0];


        if (!result) return { ok: false, message: 'User does not exist' };



        return { ok: true, message: 'user Verified', user: result };
    } catch (err) {
        return { ok: false, message: err.message };
    }


}

export { userVerification };