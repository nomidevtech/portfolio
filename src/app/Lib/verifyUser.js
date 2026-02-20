import { decryptPass } from "../utils/decryptPass";
import { db } from "./turso";

export default async function verifyUser(username, pass) {

    if (!username || !pass) return { ok: false, message: 'select username and pass' };

    username = username?.trim();
    pass = pass?.trim();

    try {
        const result = (await db.execute(`SELECT id, username, password FROM users where username = ?`, [username])).rows[0];

        if (!result) throw new Error('user not found');

        const dbHashPass = result.password;
        const isPassMatch = await decryptPass(pass, dbHashPass);

        if (!isPassMatch.ok) throw new Error('password did not match');




        return { ok: true, message: 'user found', userId: result.id, username: result.username };


    } catch (err) {
        console.log(err);
        return { ok: false, message: err }
    }
} 