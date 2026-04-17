import Link from "next/link";
import { db } from "../lib/turso";


export default async function Bookings() {

    const fetchDoctors = await db.execute("SELECT * FROM doctors");
    const doctorsArr = fetchDoctors?.rows || [];
    const departments = [...new Set(doctorsArr.map(r => r.department))];

    return (
        <div>
            {departments.map((department) => (
                <div key={department}>
                    <h2>Department:{department}</h2>
                    {doctorsArr
                        .filter((doc) => doc.department === department)
                        .map((fn) => (
                            <div className="border-2" key={fn.public_id}>
                                <Link
                                    href={`/booking/${fn.public_id}`}
                                    key={fn.public_id}
                                >
                                    👉  {fn.name}
                                </Link>
                            </div>
                        ))
                    }
                </div>
            ))}
        </div>
    );
}