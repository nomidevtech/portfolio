"use server";

import crypto from "crypto";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { db } from "../lib/turso";
import { compare, hash } from "../utils/bcrypt";
import { getUserPlus } from "../lib/getUser";
import { sendEmail } from "../lib/resend";

export async function updateAdmin(_, formData) {
    const adminPubId = formData.get("adminPubId")?.trim();
    const name = formData.get("name")?.trim().replace(/\s/g, "-").toLowerCase();
    const username = formData.get("username")?.trim();
    const email = formData.get("email")?.trim();
    const clinic_name = formData.get("clinic_name")?.trim().replace(/\s/g, "-").toLowerCase();
    const clinic_phone = formData.get("clinic_phone")?.trim();
    const clinic_address = formData.get("clinic_address")?.trim().replace(/\s/g, "-").toLowerCase();
    const current_password = formData.get("current_password");
    const new_password = formData.get("new_password");

    if (!adminPubId || !name || !username || !email || !clinic_name || !clinic_phone || !clinic_address)
        return { ok: false, message: "Missing fields" };

    if ((current_password && !new_password) || (!current_password && new_password))
        return { ok: false, message: "Both current and new passwords are required to change your password." };

    if ((!name.match(/^[a-zA-Z-]+$/)) || name.length > 20 || name.length < 3)
        return { ok: false, message: "Name should only contain letters and spaces and should be 3-20 characters long." };

    if (!email.match(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/))
        return { ok: false, message: "Invalid email address." };

    if (!/^\+?[0-9]{7,15}$/.test(clinic_phone))
        return { ok: false, message: "Phone number must contain only digits (7–15), with an optional leading +." };

    if (username.length > 15 || username.length < 3)
        return { ok: false, message: "Username should be 3-15 characters long." };

    if (new_password && new_password.length < 8)
        return { ok: false, message: "New password must be at least 8 characters." };

    const getCurrentUser = await getUserPlus();
    if (!getCurrentUser || getCurrentUser.role !== "admin") redirect("/login");
    if (getCurrentUser.admin_details.public_id !== adminPubId) return { ok: false, message: "Unauthorized" };

    if (username !== getCurrentUser.admin_details.admin_username) {
        const checkUsernameAvailability = await Promise.all([
            db.execute("SELECT id FROM admins WHERE admin_username = ?", [username]),
            db.execute("SELECT id FROM users WHERE username = ?", [username]),
        ]);
        if (checkUsernameAvailability[0].rows.length > 0 || checkUsernameAvailability[1].rows.length > 0)
            return { ok: false, message: "Username is already taken." };
    }

    const adminIdInAdminTable = getCurrentUser.admin_id;
    const userIdInUsersTable = getCurrentUser.id;
    const emailChanged = getCurrentUser.admin_details.admin_email !== email;

    const cookieStore = await cookies();
    const currentSessionToken = cookieStore.get("token")?.value;

    let new_passwordHash = null;
    if (current_password && new_password) {
        const passwordMatch = await compare(current_password, getCurrentUser.admin_details.password);
        if (!passwordMatch) return { ok: false, message: "Password mismatch" };
        new_passwordHash = await hash(new_password, 12);
    }

    let email_token = null;
    let email_token_hash = null;
    if (emailChanged) {
        email_token = crypto.randomBytes(32).toString("hex");
        email_token_hash = await hash(email_token, 12);
    }

    try {
        if (emailChanged && new_passwordHash) {
            await db.execute(
                "UPDATE admins SET admin_name=?, admin_username=?, admin_email=?, clinic_name=?, clinic_phone=?, clinic_address=?, password=?, status='unverified', email_token_hash=?, email_token_created_at=CURRENT_TIMESTAMP WHERE id=?",
                [name, username, email, clinic_name, clinic_phone, clinic_address, new_passwordHash, email_token_hash, adminIdInAdminTable]
            );
            await db.execute("UPDATE users SET username=?, password=?, status='unverified' WHERE id=?",
                [username, new_passwordHash, userIdInUsersTable]);
            await db.execute("DELETE FROM sessions WHERE user_id = ? AND session_id != ?",
                [userIdInUsersTable, currentSessionToken]);
        } else if (emailChanged) {
            await db.execute(
                "UPDATE admins SET admin_name=?, admin_username=?, admin_email=?, clinic_name=?, clinic_phone=?, clinic_address=?, status='unverified', email_token_hash=?, email_token_created_at=CURRENT_TIMESTAMP WHERE id=?",
                [name, username, email, clinic_name, clinic_phone, clinic_address, email_token_hash, adminIdInAdminTable]
            );
            await db.execute("UPDATE users SET username=?, status='unverified' WHERE id=?",
                [username, userIdInUsersTable]);
            await db.execute("DELETE FROM sessions WHERE user_id = ? AND session_id != ?",
                [userIdInUsersTable, currentSessionToken]);
        } else if (new_passwordHash) {
            await db.execute(
                "UPDATE admins SET admin_name=?, admin_username=?, clinic_name=?, clinic_phone=?, clinic_address=?, password=? WHERE id=?",
                [name, username, clinic_name, clinic_phone, clinic_address, new_passwordHash, adminIdInAdminTable]
            );
            await db.execute("UPDATE users SET username=?, password=? WHERE id=?",
                [username, new_passwordHash, userIdInUsersTable]);
            await db.execute("DELETE FROM sessions WHERE user_id = ? AND session_id != ?",
                [userIdInUsersTable, currentSessionToken]);
        } else {
            await db.execute(
                "UPDATE admins SET admin_name=?, admin_username=?, clinic_name=?, clinic_phone=?, clinic_address=? WHERE id=?",
                [name, username, clinic_name, clinic_phone, clinic_address, adminIdInAdminTable]
            );
            await db.execute("UPDATE users SET username=? WHERE id=?",
                [username, userIdInUsersTable]);
        }
    } catch (e) {
        console.error(e);
        return { ok: false, message: "Update failed" };
    }

    if (emailChanged) {
        const html = `<p>Click to activate your new email.</p><a href="${process.env.NEXT_PUBLIC_APP_URL}/activation/${email_token}/${adminPubId}">Activate Account</a>`;
        await sendEmail({ to: email, subject: "Account Activation", html });
        redirect(`/verification/${adminPubId}`);
    }

    redirect("/settings");
};






export async function updateDoctor(_, formData) {
    const docPublicId = formData.get("docPublicId")?.trim();
    const name = formData.get("name")?.trim().replace(/\s/g, "-").toLowerCase();
    const username = formData.get("username")?.trim();
    const current_password = formData.get("current_password");
    const new_password = formData.get("new_password");
    const qualificationsRaw = formData.get("qualifications")
        ?.split(",").map((q) => q.trim().toUpperCase()).filter(Boolean).slice(0, 10) || [];
    const qualificationsJson = JSON.stringify(qualificationsRaw);

    if (!docPublicId || !name || !username) return { ok: false, message: "Missing fields" };

    const getCurrentUser = await getUserPlus();
    if (!getCurrentUser || getCurrentUser.role !== "doctor") redirect("/login");

    if ((!name.match(/^[a-zA-Z-]+$/)) || name.length > 20 || name.length < 3)
        return { ok: false, message: "Name should only contain letters and spaces and should be 3-20 characters long." };

    if (username.length > 15 || username.length < 3)
        return { ok: false, message: "Username should be 3-15 characters long." };

    if ((current_password && !new_password) || (!current_password && new_password))
        return { ok: false, message: "Both current and new passwords are required to change your password." };

    if (new_password && new_password.length < 8)
        return { ok: false, message: "New password must be at least 8 characters." };

    if (username !== getCurrentUser.username) {
        const checkUsernameAvailability = await Promise.all([
            db.execute("SELECT id FROM admins WHERE admin_username = ?", [username]),
            db.execute("SELECT id FROM users WHERE username = ?", [username]),
        ]);
        if (checkUsernameAvailability[0].rows.length > 0 || checkUsernameAvailability[1].rows.length > 0)
            return { ok: false, message: "Username is already taken." };
    }

    const doctorIdInTable = getCurrentUser.doctor_id;
    const userIdInUsersTable = getCurrentUser.id;

    if (getCurrentUser.doctor_details.public_id !== docPublicId) return { ok: false, message: "Unauthorized" };

    const cookieStore = await cookies();
    const currentSessionToken = cookieStore.get("token")?.value;

    try {
        let new_passwordHash = null;
        if (current_password && new_password) {
            const passwordMatch = await compare(current_password, getCurrentUser.doctor_details.password);
            if (!passwordMatch) return { ok: false, message: "Password mismatch" };
            new_passwordHash = await hash(new_password, 12);
        }

        if (new_passwordHash) {
            await db.execute("UPDATE doctors SET name = ?, username = ?, qualifications = ?, password = ? WHERE id = ?",
                [name, username, qualificationsJson, new_passwordHash, doctorIdInTable]);
            await db.execute("UPDATE users SET username = ?, password = ? WHERE id = ?",
                [username, new_passwordHash, userIdInUsersTable]);
            await db.execute("DELETE FROM sessions WHERE user_id = ? AND session_id != ?",
                [userIdInUsersTable, currentSessionToken]);
        } else {
            await db.execute("UPDATE doctors SET name = ?, username = ?, qualifications = ? WHERE id = ?",
                [name, username, qualificationsJson, doctorIdInTable]);
            await db.execute("UPDATE users SET username = ? WHERE id = ?",
                [username, userIdInUsersTable]);
        }
    } catch (e) {
        console.error(e);
        return { ok: false, message: "Update failed" };
    }

    redirect("/settings");
}