"use server";

import { db } from "@/app/lib/turso";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import getMinutes from "@/app/utils/getMinutes"; // Adjust path if needed
import { getUserPlus } from "@/app/lib/getUser";
import { rollingWindow } from "@/app/lib/rollingWindow";

export async function updateWeeklyTemplateServerAction(formData) {

  const currentUser = await getUserPlus();
  if (!currentUser || currentUser.role !== "admin" || !currentUser.admin_id) redirect("/login");

  const adminId = currentUser.admin_id;


  const docPubId = formData.get("doctorPublicId");
  if (!docPubId) return redirect("/edit-template");

  const fetchDocId = await db.execute(`SELECT id FROM doctors WHERE public_id = ? AND admin_id = ?`, [docPubId, adminId]);
  if (fetchDocId?.rows.length === 0) return redirect("/edit-template");

  const templatePubId = formData.get("templatePublicId");
  if (!templatePubId) return redirect("/edit-template");


  const fetchTemplateId = await db.execute(`SELECT id FROM weekly_templates WHERE public_id = ? AND doctor_id = ? AND admin_id = ?`, [templatePubId, fetchDocId.rows[0].id, adminId]);
  if (fetchTemplateId?.rows.length === 0) return redirect("/edit-template");




  const startTime = getMinutes(formData.get("startHr"), formData.get("startMin"), formData.get("startMeridiem"));
  const endTime = getMinutes(formData.get("endHr"), formData.get("endMin"), formData.get("endMeridiem"));
  const breakStart = getMinutes(formData.get("breakStartHr"), formData.get("breakStartMin"), formData.get("breakStartMeridiem"));
  const breakEnd = getMinutes(formData.get("breakEndHr"), formData.get("breakEndMin"), formData.get("breakEndMeridiem"));

  const buffer_time = Number(formData.get("buffer"));

  if (startTime === null || endTime === null || breakStart === null || breakEnd === null || isNaN(buffer_time)) return redirect("/edit-template");

  try {
    await db.execute({
      sql: `UPDATE weekly_templates 
            SET start_time = ?, end_time = ?, break_start = ?, break_end = ?, buffer_minutes = ?
            WHERE id = ?`,
      args: [startTime, endTime, breakStart, breakEnd, buffer_time, fetchTemplateId.rows[0].id]
    });
  } catch (e) {
    console.error("Update failed:", e);
    throw new Error("Could not update template");
  }

  //revalidatePath(`/edit-template/${docPubId}/${templatePubId}`);
  redirect(`/edit-template/${docPubId}`);
}