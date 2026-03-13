'use server';

import { Resend } from "resend";
import crypto from "crypto";
import { hash } from "../utils/bcrypt";
import { db } from "../lib/turso";
import { getUser } from "../lib/getUser";

const resendInstance = new Resend(process.env.RESEND_API_KEY);

export const emailOrchestrator = async (email) => {
    const user = await getUser();
    if (!user) return { ok: false, message: "User not logged in" };

    const userId = user.id;
    const user_pid = user.public_id;
    const token = crypto.randomBytes(32).toString("hex");
    const hashToken = await hash(token);

    try {
        const verified = await isVerified(userId);
        if (verified.email === email && verified.email_verified) {
            return { ok: true, message: "Email is already verified." };
        }

        const inserted = await insertTokenIntoDB(userId, hashToken);
        if (!inserted) return { ok: false, message: "Something went wrong" };

        const sent = await sendWithResend(resendInstance, user_pid, email, token);
        return sent;

    } catch (error) {
        console.error(error);
        return { ok: false, message: "Something went wrong" };
    }
}

const isVerified = async (userId) => {
    const result = await db.execute(
        `SELECT email, email_verified FROM users WHERE id = ?`,
        [userId]
    );
    return { email: result.rows[0]?.email, email_verified: result.rows[0]?.email_verified === 1 };
}

const insertTokenIntoDB = async (userId, token) => {
    const result = await db.execute(
        `UPDATE users SET email_token = ? WHERE id = ?`,
        [token, userId]
    );
    return result.rowsAffected === 1;
}

const sendWithResend = async (resendInstance, user_pid, email, token) => {
    const url = `http://localhost:3000/verify/?pid=${user_pid}&token=${token}`;
    const result = await resendInstance.emails.send({
        from: "MUB <noreply@nomidev.com>",
        to: email,
        subject: "Verify your email address",
        html: `<p>Click <a href="${url}">here</a> to verify your email address.</p>`,
    });
    console.log(result);
    return result;
}