'use server'

import { encryptPass } from "@/app/Lib/encryptPass";
import { db } from "@/app/Lib/turso";
import getSession from "@/app/Lib/getSession";
import verifyUser from "@/app/Lib/verifyUser";

export async function changePassServerAction(prevState, formData) {
  try {
    const oldPassword = formData.get('oldPassword');
    const newPassword = formData.get('newPassword');

    if (!oldPassword || !newPassword) {
      return { ok: false, message: 'Old and new password required' };
    }

    // 1) Get session
    const session = await getSession();
    if (!session.ok) return { ok: false, message: 'Login again' };

    // 2) Get username from session
    const userId = session.session.user_id;

    const userRecord = (await db.execute(`SELECT username, password FROM users WHERE id = ?`, [userId])).rows[0];
    if (!userRecord) return { ok: false, message: 'User not found' };

    // 3) Verify old password
    const isVerified = await verifyUser(userRecord.username, oldPassword);
    if (!isVerified.ok) {
      console.log('i am msg=======================>', isVerified.message)
      return { ok: false, message: 'Old password did not match' };
    }

    // 4) Hash new password
    const newPasswordHash = await encryptPass(newPassword);

    if (!newPasswordHash) return { ok: false, message: 'Error while hashing new password' };

    // 5) Update password
    const updateResult = await db.execute(`UPDATE users SET password = ? WHERE id = ?`, [newPasswordHash, userId]);

    if (updateResult.rowsAffected === 0) return { ok: false, message: 'Error updating password' };

    return { ok: true, message: 'Success, password updated' };

  } catch (err) {
    console.log(err);
    return { ok: false, message: err instanceof Error ? err.message : 'Failed to change password' };
  }
}