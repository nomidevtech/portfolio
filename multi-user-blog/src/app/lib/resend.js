'use server';

import { Resend } from "resend";
import crypto from "crypto";
import { hash } from "../utils/bcrypt";
import { db } from "../lib/turso";


const resendInstance = new Resend(process.env.RESEND_API_KEY);

export const emailOrchestrator = async (user_pid, email, incomingToken) => {
    try {
        const verified = await isVerified(user_pid);
        if (verified.email === email && verified.email_verified) {
            return { ok: true, message: "Email is already verified." };
        }

        // Only generate + store a new token when not called from signup
        if (!incomingToken) {
            incomingToken = crypto.randomBytes(32).toString("hex");
            const hashToken = await hash(incomingToken);
            const inserted = await insertTokenIntoDB(user_pid, hashToken);
            if (!inserted) return { ok: false, message: "Something went wrong" };
        }

        return await sendWithResend(resendInstance, user_pid, email, incomingToken);
    } catch (error) {
        console.error(error);
        return { ok: false, message: "Something went wrong" };
    }
}

const isVerified = async (user_pid) => {
    const result = await db.execute(
        `SELECT email, email_verified FROM users WHERE  public_id = ?`,
        [user_pid]
    );
    return { email: result.rows[0]?.email, email_verified: result.rows[0]?.email_verified === 1 };
}

const insertTokenIntoDB = async (userPId, token) => {
    const result = await db.execute(
        `UPDATE users SET email_token = ? WHERE public_id = ?`,
        [token, userPId]
    );
    return result.rowsAffected === 1;
}

const sendWithResend = async (resendInstance, user_pid, email, token) => {
    const url = `https://portfolio-2mnb.vercel.app/?pid=${user_pid}&token=${token}`;
    const result = await resendInstance.emails.send({
        from: "MUB <noreply@nomidev.com>",
        to: email,
        subject: "Verify your email address",
        html: `<p>Click <a href="${url}">here</a> to verify your email address.</p>`,
    });

    return result;
}