import Link from "next/link";
import { db } from "../lib/turso";

export default async function AllClinics() {

    const fetchAllClinics = await db.execute(`SELECT public_id, clinic_name, clinic_phone, clinic_address FROM admins`);
    if (fetchAllClinics.rows.length === 0) return <p>No clinics found</p>


    return (<>
        {fetchAllClinics.rows.map(fn => (
            <div key={fn.public_id} className="border-2 border-amber-50" >
                <p>Clinic Name: {fn.clinic_name.split("-").map(word => word[0].toUpperCase() + word.slice(1)).join(" ")}</p>
                <p>Phone: {fn.clinic_phone}</p>
                <p>Address: {fn.clinic_address.split("-").map(word => word[0].toUpperCase() + word.slice(1)).join(" ")}</p>
                <Link href={`/bookings/${fn.public_id}`}>Bookings⬅</Link>
            </div>
        ))}
    </>);
}