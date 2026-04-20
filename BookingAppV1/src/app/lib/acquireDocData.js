import { db } from "./turso";

export default async function acquireDoctorsData() {

    const fetchDoctors = await db.execute("SELECT * FROM doctors");
    const doctorsArr = fetchDoctors?.rows || [];
    const departments = [...new Set(doctorsArr.map(r => r.department))];

    return { doctorsArr, departments };
}