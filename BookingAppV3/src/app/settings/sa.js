"use server";

import { redirect } from "next/navigation";
import { db } from "../lib/turso";
import { compare, hash } from "../utils/bcrypt";
import { getUserPlus } from "../lib/getUser";

export async function updateAdmin(formData) {
    const adminPubId = formData.get("adminPubId")?.trim();
    const name = formData.get("name")?.trim().replace(/\s/g, "-").toLowerCase();
    const username = formData.get("username")?.trim();
    const email = formData.get("email")?.trim();
    const clinic_name = formData.get("clinic_name")?.trim().replace(/\s/g, "-").toLowerCase();
    const clinic_phone = formData.get("clinic_phone")?.trim();
    const clinic_address = formData.get("clinic_address")?.trim().replace(/\s/g, "-").toLowerCase();
    const current_password = formData.get("current_password");
    const new_password = formData.get("new_password");

    if (!adminPubId || !name || !username || !email || !clinic_name || !clinic_phone || !clinic_address) return { error: "Missing fields" };

    const getCurrentUser = await getUserPlus();
    if (!getCurrentUser || getCurrentUser.role !== "admin") redirect("/login");

    const adminIdInAdminTable = getCurrentUser.admin_id;
    const userIdInUsersTable = getCurrentUser.id;

    if (getCurrentUser.admin_details.public_id !== adminPubId) return { error: "Unauthorized" };

    try {
        let new_passwordHash = null;
        if (new_password && current_password) {
            const passwordMatch = await compare(current_password, getCurrentUser.admin_details.password);
            if (!passwordMatch) return { error: "Password mismatch" };
            new_passwordHash = await hash(new_password, 12);
        }

        if (new_passwordHash) {
            await db.execute("UPDATE admins SET admin_name = ?, admin_username = ?, admin_email = ?, clinic_name = ?, clinic_phone = ?, clinic_address = ?, password = ? WHERE id = ?",
                [name, username, email, clinic_name, clinic_phone, clinic_address, new_passwordHash, adminIdInAdminTable]);
            await db.execute("UPDATE users SET username = ?, password = ? WHERE id = ?",
                [username, new_passwordHash, userIdInUsersTable]);
        } else {
            await db.execute("UPDATE admins SET admin_name = ?, admin_username = ?, admin_email = ?, clinic_name = ?, clinic_phone = ?, clinic_address = ? WHERE id = ?",
                [name, username, email, clinic_name, clinic_phone, clinic_address, adminIdInAdminTable]);
            await db.execute("UPDATE users SET username = ? WHERE id = ?",
                [username, userIdInUsersTable]);
        }
    } catch (e) {
        return { error: "Update failed" };
    }

    redirect("/settings");
}

export async function updateDoctor(formData) {
    const docPublicId = formData.get("docPublicId")?.trim();
    const name = formData.get("name")?.trim().replace(/\s/g, "-").toLowerCase();
    const username = formData.get("username")?.trim();
    const current_password = formData.get("current_password");
    const new_password = formData.get("new_password");
    const qualificationsRaw = formData.get("qualifications")?.split(",").map((q) => q.trim().toUpperCase()).filter(Boolean) || [];
    const qualificationsJson = JSON.stringify(qualificationsRaw);

    if (!docPublicId || !name || !username) return { error: "Missing fields" };

    const getCurrentUser = await getUserPlus();
    if (!getCurrentUser || getCurrentUser.role !== "doctor") redirect("/login");

    const doctorIdInTable = getCurrentUser.doctor_id;
    const userIdInUsersTable = getCurrentUser.id;

    if (getCurrentUser.doctor_details.public_id !== docPublicId) return { error: "Unauthorized" };

    try {
        let new_passwordHash = null;
        if (current_password && new_password) {
            const passwordMatch = await compare(current_password, getCurrentUser.doctor_details.password);
            if (!passwordMatch) return { error: "Password mismatch" };
            new_passwordHash = await hash(new_password, 12);
        }

        if (new_passwordHash) {
            await db.execute("UPDATE doctors SET name = ?, username = ?, qualifications = ?, password = ? WHERE id = ?",
                [name, username, qualificationsJson, new_passwordHash, doctorIdInTable]);
            await db.execute("UPDATE users SET username = ?, password = ? WHERE id = ?",
                [username, new_passwordHash, userIdInUsersTable]);
        } else {
            await db.execute("UPDATE doctors SET name = ?, username = ?, qualifications = ? WHERE id = ?",
                [name, username, qualificationsJson, doctorIdInTable]);
            await db.execute("UPDATE users SET username = ? WHERE id = ?",
                [username, userIdInUsersTable]);
        }
    } catch (e) {
        return { error: "Update failed" };
    }

    redirect("/settings");
}