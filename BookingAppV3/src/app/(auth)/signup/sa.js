"use server";

import { db } from "@/app/lib/turso";
import { initAdminTable, initUsersTable } from "@/app/Models/initTables";
import { hash } from "@/app/utils/bcrypt";
import { nanoid } from "nanoid";
import { redirect } from "next/navigation";

export async function signupServerAction(_, formData) {
    await initAdminTable();
    await initUsersTable();
    const admin_name = formData.get("full_name")?.replace(/\s+/g, '-').toLowerCase();
    const admin_email = formData.get("admin_email");
    const username = formData.get("username")?.replace(/\s+/g, '-');
    const password = formData.get("password");
    const confirm_password = formData.get("confirm_password");

    const clinic_name = formData.get("clinic_name")?.replace(/\s+/g, '-').toLowerCase();
    const clinic_email = formData.get("clinic_email");
    const clinic_phone = formData.get("clinic_phone");
    const clinic_address = formData.get("clinic_address")?.replace(/\s+/g, '-').toLowerCase();

    const public_id = nanoid(12);

    if (password !== confirm_password) {
        return { ok: false, message: "Passwords do not match" };
    }

    const hashedPassword = await hash(password);

    try {

        const isUsernameAvailable = await db.execute("SELECT username FROM users WHERE username = ?", [username]);
        if (isUsernameAvailable.rows.length > 0) return { ok: false, message: "Username already exists" }

        const res = await db.execute(`INSERT INTO admins ( public_id, admin_name, admin_email, admin_username, 
                clinic_name, clinic_phone, clinic_address, password ) VALUES (?, ?, ?, ?, ?, ?, ?, ?) RETURNING id`,
            [
                public_id,
                admin_name,
                admin_email,
                username,
                clinic_name,
                clinic_phone,
                clinic_address,
                hashedPassword
            ]);



        await db.execute(
            `INSERT INTO users ( public_id, admin_id, role, username, password ) VALUES (?, ?, ?, ?, ?)`, [nanoid(12),
            res.rows[0]?.id,
            "admin",
            username,
            hashedPassword]
        );

    } catch (error) {
        console.error(error);
        return { ok: false, message: "Registration failed. Username might already exist." };
    }
    redirect("/login");
}
