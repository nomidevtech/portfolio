import { db } from "../../lib/turso";

export default async function AppointmentByDoctor({ params }) {
    const { pId } = await params;

    const d = new Date();
    const currentMonthNumber = d.getMonth();
    const year = d.getFullYear();

    const fetchDoctorDetails = await db.execute("SELECT id, name, department FROM doctors WHERE public_id = ?", [pId]);
    const doctorId = fetchDoctorDetails.rows[0]?.id;
    const doctorName = fetchDoctorDetails.rows[0]?.name;
    const department = fetchDoctorDetails.rows[0]?.department;
    if (!doctorId) return <div>Doctor not found</div>;

    const fetchBookings = await db.execute(`SELECT * FROM bookings WHERE doctor_id = ? AND year = ? AND month_number = ?`, [doctorId, year, currentMonthNumber]);
    const bookings = fetchBookings.rows;
    if (bookings.length === 0) return <div>No bookings found</div>;



    return (<>
        <div>{pId}</div>
    </>);
}