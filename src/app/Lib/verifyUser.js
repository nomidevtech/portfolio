import { decryptPass } from "./decryptPass";
import { db } from "./turso";

export default async function verifyUser(username, pass) {

    if (!username || !pass) return { ok: false, message: 'select username and pass' };

    username = username?.trim();
    pass = pass?.trim();

    try {
        const result = (await db.execute(`SELECT id, username, password FROM users where username = ?`, [username])).rows[0];

        if (!result) return { ok: false, message: 'no user found' };

        const dbHashPass = result.password;
        const isPassMatch = await decryptPass(pass, dbHashPass);

        if (!isPassMatch.ok) return { ok: false, message: 'password did not match' };




        return { ok: true, message: 'user found', user: result };


    } catch (err) {
        console.log(err);
        return { ok: false, message: err }
    }
} 