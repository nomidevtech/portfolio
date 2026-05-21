import Link from "next/link";
import { fromHyphenSlug } from "@/app/utils/displaySlug";

export default async function ByDoctors({ fetchedDoctors = [], navString = "" }) {
    const doctors = fetchedDoctors.rows?.map(doctor => ({
        public_id: doctor.public_id,
        name: doctor.name,
        department: doctor.department,
    })) || [];

    const departments = [...new Set(doctors.map(d => d.department))];

    return (
        <div className="grid gap-5">
            {departments.length > 0 ? departments.map(dep => (
                <section key={dep} className="section-panel">
                    <h2 className="text-xl font-black text-slate-950">{fromHyphenSlug(dep)}</h2>
                    <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        {doctors.filter(doc => doc.department === dep).map(doc => (
                            <Link
                                key={doc.public_id}
                                href={`/${navString}/${doc.public_id}`}
                                className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4 font-semibold text-slate-800 hover:border-teal-300 hover:bg-white"
                            >
                                Dr. {fromHyphenSlug(doc.name)}
                            </Link>
                        ))}
                    </div>
                </section>
            )) : (
                <p className="section-panel text-slate-600">No doctors found.</p>
            )}
        </div>
    );
}
