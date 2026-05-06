"use server";


import { redirect } from "next/navigation";
import { db } from "../lib/turso";
import { compare, hash } from "../utils/bcrypt";
import { getUserPlus } from "../lib/getUser";


export async function updateAdmin(formData) {


    const adminPubId = formData.get("adminPubId")?.trim();
    const name = formData.get("name")?.trim();
    const username = formData.get("username")?.trim();
    const email = formData.get("email")?.trim();
    const clinic_name = formData.get("clinic_name")?.trim();
    const clinic_phone = formData.get("clinic_phone")?.trim();
    const clinic_address = formData.get("clinic_address")?.trim();
    const current_password = formData.get("current_password");
    const new_password = formData.get("new_password");

    if (!adminPubId) return null;

    const getCurrentUser = await getUserPlus();
    if (!getCurrentUser || getCurrentUser.role !== "admin") redirect("/login");
    const currentUser = getCurrentUser.admin_details;
    if (currentUser.public_id !== adminPubId) return null;

    if (!name || !username || !email || !clinic_name || !clinic_phone || !clinic_address) return null;

    let passwordMatch = null;
    let new_passwordHash = null;

    if (current_password || new_password) {
        passwordMatch = await compare(current_password, currentUser.password);
        new_passwordHash = await hash(new_password, 12);
    }

    if (new_password && current_password && !passwordMatch) return null;

    if (new_password && passwordMatch) {
        await db.execute("UPDATE admins SET admin_name = ?, admin_username = ?, admin_email = ?, clinic_name = ?, clinic_phone = ?, clinic_address = ?, password = ? WHERE id = ?", [name, username, email, clinic_name, clinic_phone, clinic_address, new_passwordHash, getCurrentUser.id]);

        if (username !== currentUser.username) {
            await db.execute(
                "UPDATE users SET username = ?, password = ? WHERE id = ?",
                [username, new_passwordHash, getCurrentUser.id]
            );
        }

        redirect("/settings");
    }

    await db.execute("UPDATE admins SET admin_name = ?, admin_username = ?, admin_email = ?, clinic_name = ?, clinic_phone = ?, clinic_address = ? WHERE id = ?", [name, username, email, clinic_name, clinic_phone, clinic_address, getCurrentUser.id]);

    if (username !== currentUser.username) {
        await db.execute(
            "UPDATE users SET username = ?, password = ? WHERE id = ?",
            [username, new_passwordHash, getCurrentUser.id]
        );
    }

    redirect("/settings");






}



export async function updateDoctor(formData) {

    const docPublicId = formData.get("docPublicId")?.trim();
    const name = formData.get("name")?.trim();
    const username = formData.get("username")?.trim();
    const current_password = formData.get("current_password");
    const new_password = formData.get("new_password");
    const qualificationsRaw = formData.get("qualifications")?.split(",")
        .map((q) => q.trim().toUpperCase())
        .filter(Boolean) || [];
    const qualificationsJson = JSON.stringify(qualificationsRaw);

    if (!docPublicId) return { error: "Missing doctor ID." };


    const getCurrentUser = await getUserPlus();
    if (!getCurrentUser || getCurrentUser.role !== "doctor") redirect("/login");

    const currentUser = getCurrentUser.doctor_details;
    if (currentUser.public_id !== docPublicId) return { error: "Unauthorized." };


    let passwordMatch = null;
    let new_passwordHash = null;

    if (current_password && new_password) {
        passwordMatch = await compare(current_password, currentUser.password_hash);
        new_passwordHash = await hash(new_password, 12);
    }

    if (new_password && current_password && !passwordMatch) return { error: "Incorrect current password." };

    if (new_password && passwordMatch) {
        await db.execute("UPDATE doctors SET name = ?, username = ?, qualifications = ?, password = ? WHERE id = ?", [name, username, qualificationsJson, new_passwordHash, getCurrentUser.id]);

        if (username !== currentUser.username) {
            await db.execute(
                "UPDATE users SET username = ?, password = ? WHERE id = ?",
                [username, new_passwordHash, getCurrentUser.id]
            );
        }

        redirect("/settings");
    }

    await db.execute("UPDATE doctors SET name = ?, username = ?, qualifications = ? WHERE id = ?", [name, username, qualificationsJson, getCurrentUser.id]);

    if (username !== currentUser.username) {
        await db.execute(
            "UPDATE users SET username = ? , password = ? WHERE id = ?",
            [username, new_passwordHash, getCurrentUser.id]
        );
    }

    redirect("/settings");
}