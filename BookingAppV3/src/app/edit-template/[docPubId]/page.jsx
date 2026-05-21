import { db } from "@/app/lib/turso";
import { fromHyphenSlug } from "@/app/utils/displaySlug";
import Link from "next/link";
import { minutesToMeridiem } from "@/app/utils/minutes-to-meridiem";
import { getDayName } from "@/app/utils/getDateData";
import { getUserPlus } from "@/app/lib/getUser";
import { redirect } from "next/navigation";
import { DeleteTemplateButton } from "@/app/components/DeleteTemplateButton";

export const metadata = {
    title: "Doctor Templates",
    description: "Review and edit a doctor's weekly schedule templates.",
};

export default async function DoctorEditTemplates({ params }) {
    const currentUser = await getUserPlus();
    if (!currentUser) return redirect("/login");
    if (!currentUser || currentUser.role !== "admin" || !currentUser.admin_id || currentUser.status !== "verified") redirect(`/verification/${currentUser?.admin_details?.public_id}`);
    const adminId = currentUser.admin_id;

    const { docPubId } = await params;

    const fetchDoctor = await db.execute(`SELECT * FROM doctors WHERE public_id = ? AND admin_id = ?`, [docPubId, adminId]);
    if (fetchDoctor.rows.length === 0) return <main className="page-shell"><p className="status-error">Broken link. Doctor not found.</p></main>

    const { name, id } = fetchDoctor.rows[0];
    const doctorName = fromHyphenSlug(name);

    const fetchTemplates = await db.execute(`SELECT * FROM weekly_templates WHERE doctor_id = ? AND admin_id = ?`, [id, adminId]);
    if (fetchTemplates.rows.length === 0) {
        return (
            <main className="page-shell-narrow">
                <p className="status-warning">No templates found.</p>
                <Link href={`/create-template/${docPubId}`} className="btn-primary mt-4">Create template</Link>
            </main>
        );
    }

    return (
        <main className="page-shell">
            <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
                <div>
                    <p className="soft-pill">Schedule templates</p>
                    <h1 className="mt-4 text-3xl font-black text-slate-950">Dr. {doctorName}&apos;s templates</h1>
                    <p className="mt-2 text-slate-600">Edit or remove weekly availability rules.</p>
                </div>
                <Link href={`/create-template/${docPubId}`} className="btn-primary">Create new template</Link>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                {fetchTemplates.rows.map(temp => (
                    <section key={temp.public_id} className="data-card">
                        <div className="flex flex-wrap items-start justify-between gap-3">
                            <div>
                                <h2 className="text-xl font-black text-slate-950">{getDayName(temp.day_number)}</h2>
                                <p className="mt-2 text-sm text-slate-600">Clinic: {minutesToMeridiem(temp.start_time, true)} - {minutesToMeridiem(temp.end_time, true)}</p>
                                <p className="text-sm text-slate-600">Break: {minutesToMeridiem(temp.break_start, true)} - {minutesToMeridiem(temp.break_end, true)}</p>
                                <p className="text-sm text-slate-600">Buffer: {temp.buffer_minutes} minutes</p>
                            </div>
                            <Link href={`/edit-template/${docPubId}/${temp.public_id}`} className="btn-secondary">Edit</Link>
                        </div>
                        <div className="mt-4">
                            <DeleteTemplateButton templatePubId={temp.public_id} docPubId={docPubId} dayName={getDayName(temp.day_number)} />
                        </div>
                    </section>
                ))}
            </div>
        </main>
    );
}
