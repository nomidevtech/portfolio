import { db } from "@/app/lib/turso";
import Link from "next/link";
import { minutesToMeridiem } from "@/app/utils/minutes-to-meridiem";
import { getDayName } from "@/app/utils/getDateData";
import { getUserPlus } from "@/app/lib/getUser";
import { redirect } from "next/navigation";
import { deleteWeeklyTemplateServerAction } from "@/app/lib/deleteWeeklyTemplate";
import Form from "next/form";


export default async function DoctorEditTemplates({ params }) {

    const currentUser = await getUserPlus();
    if (!currentUser) return redirect("/login");
    if (!currentUser || currentUser.role !== "admin" || !currentUser.admin_id || currentUser.status !== "verified") redirect(`/verification/${currentUser?.admin_details?.public_id}`);
    const adminId = currentUser.admin_id;

    const { docPubId } = await params;

    const fetchDoctor = await db.execute(`SELECT * FROM doctors WHERE public_id = ? AND admin_id = ?`, [docPubId, adminId]);
    if (fetchDoctor.rows.length === 0) return <p>Broken link. Doctor not found.</p>

    const { name, id } = fetchDoctor.rows[0];

    const fetchTemplates = await db.execute(`SELECT * FROM weekly_templates WHERE doctor_id = ? AND admin_id = ?`, [id, adminId]);
    if (fetchTemplates.rows.length === 0) return <p>No templates found.  <Link href={`/create-template/${docPubId}`}>Click Here⬅</Link></p>


    return (<>
        <h2>Dr. {name[0].toUpperCase() + name.slice(1)}'s Templates</h2>
        {fetchTemplates.rows.map(temp => (
            <div key={temp.public_id} className="border-2 border-amber-50" >
                <p>Template Day: {getDayName(temp.day_number)}</p>
                <p>Clinic Time: {minutesToMeridiem(temp.start_time, true)} - {minutesToMeridiem(temp.end_time, true)}</p>
                <p>Break Duration: {minutesToMeridiem(temp.break_start, true)} - {minutesToMeridiem(temp.break_end, true)}</p>
                <p>Buffer: {temp.buffer_minutes} minutes</p>
                <Link href={`/edit-template/${docPubId}/${temp.public_id}`}>Edit⬅</Link>
                <Form action={deleteWeeklyTemplateServerAction}>
                    <input type="hidden" name="templatePubId" value={temp.public_id} />
                    <input type="hidden" name="docPubId" value={docPubId} />
                    <button type="submit">Delete</button>
                </Form>
            </div>
        ))}

        <Link href={`/create-template/${docPubId}`}>Create New Template</Link>


    </>);
}
