import { db } from "@/app/lib/turso";
import Link from "next/link";
import { minutesToMeridiem } from "@/app/utils/minutes-to-meridiem";
import { getDayName } from "@/app/utils/getDateData";


export default async function DoctorEditTemplates({ params }) {
    const { docPubId } = await params;
    const adminId = 1;

    const fetchDoctor = await db.execute(`SELECT * FROM doctors WHERE public_id = ?`, [docPubId]);
    if (fetchDoctor.rows.length === 0) return <p>Broken link. Doctor not found.</p>

    const { name, id } = fetchDoctor.rows[0];

    const fetchTemplates = await db.execute(`SELECT * FROM weekly_templates WHERE doctor_id = ? AND admin_id = ?`, [id, adminId]);
    if (fetchTemplates.rows.length === 0) return <p>No templates found.  <Link href={`/create-template/${docPubId}`}>Click Here⬅</Link></p>

    console.log(fetchTemplates.rows)







    return (<>
    <h2>Dr. {name[0].toUpperCase() + name.slice(1)}'s Templates</h2>
        {fetchTemplates.rows.map(temp => (
            <div key={temp.public_id} className="border-2 border-amber-50" >
                <p>Template Day: {getDayName(temp.day_number)}</p>
                <p>Clinic Time: {minutesToMeridiem(temp.start_time, true)} - {minutesToMeridiem(temp.end_time, true)}</p>
                <p>Break Duration: {minutesToMeridiem(temp.break_start, true)} - {minutesToMeridiem(temp.break_end, true)}</p>
                <p>Buffer: {temp.buffer_minutes} minutes</p>
                <Link href={`/edit-template/${docPubId}/${temp.public_id}`}>Edit⬅</Link>
            </div>
        ))}

        <Link href={`/create-template/${docPubId}`}>Create New Template</Link>


    </>);
}
