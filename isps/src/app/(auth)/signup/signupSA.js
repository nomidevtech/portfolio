"use server";
import { nanoid } from "nanoid";
import { db } from "@/app/lib/turso";
import { redirect } from "next/navigation";
import { redisIpLimit } from "@/app/utils/redidIpLimit";
import { hashPassword } from "@/app/utils/hash";

import {
  normalizeUsername,
  validateUsername,
  validateAdminPassword,
} from "@/app/utils/validation";

export async function signuptServerAction(_, formData) {

    const username = normalizeUsername(formData.get("username"));
    const password = formData.get("password")?.toString();
    const confirmPassword = formData.get("confirmPassword")?.toString();

    const usernameError = validateUsername(username);
    if (usernameError) {
      return { ok: false, message: usernameError };
    }

    const passwordError = validateAdminPassword(password);
    if (passwordError) {
      return { ok: false, message: passwordError };
    }

    if (password !== confirmPassword) {
      return { ok: false, message: "Passwords do not match" };
    }

    const ipLimit = await redisIpLimit(5, 'signup_check');
    if (!ipLimit.ok) return ipLimit;

    try {

        const user_pid = nanoid(12);
        const hashedPassword = hashPassword(password);

        const result = await db.execute(`
            INSERT INTO admins (public_id, username, password)
            VALUES (?, ?, ?)
        `, [user_pid, username, hashedPassword]);

        if (result.rowsAffected === 0) {
            return { ok: false, message: 'Something went wrong' };
        }


    } catch (error) {
        console.error(error);
        if (error.message && error.message.includes("UNIQUE")) {
            return { ok: false, message: 'Username already in use' };
        }
        return { ok: false, message: 'something went wrong while signing up' };
    }

    redirect('/login');
}