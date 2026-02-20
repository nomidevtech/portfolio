import { db } from "./turso";

export default async function getUser(id) {

    if (!id) return { ok: false, message: 'no user found' };


    try {
        const result = (await db.execute(`SELECT id, username, role FROM users where id = ?`, [id])
        ).rows[0];

        if (!result) return { ok: false, message: 'no user found' };

        return { ok: true, message: 'user found', user: result };


    } catch (err) {
        console.log(err);
        return { ok: false, message: err }
    }
} 