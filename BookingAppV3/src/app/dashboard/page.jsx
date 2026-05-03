import { redirect } from "next/navigation";
import { getUser, getUserPlus } from "../lib/getUser";
import AdminComponent from "./admin-component";
import DoctorComponent from "./doctor-component";
import { db } from "../lib/turso";

export default async function Dashboard() {

    const currentUser = await getUserPlus();
    //if (!currentUser?.id) return redirect("/login");

    console.log("currentUser", currentUser);

    // let doctor = null;
    // let admin = null;

    // let doctorBookings = null;
    // let allBooking = null;

    // if (currentUser?.role === "doctor") {
    //     const [fetchDoctor, fetchBookings] = await Promise.all([
    //         db.execute(`SELECT * FROM doctors WHERE id = ?`, [currentUser.doctor_id]),
    //         db.execute(`SELECT bookings.*, treatments.name AS treatment_name, treatments.duration AS treatment_duration FROM bookings LEFT JOIN treatments ON bookings.treatment_id = treatments.id WHERE bookings.doctor_id = ? ORDER BY date_number ASC`, [currentUser.doctor_id])
    //     ]);

    //     doctor = fetchDoctor.rows[0];
    //     doctorBookings = fetchBookings.rows;

    //     for (const booking of doctorBookings) {
    //         booking.uniqueKey = `${booking.date_number}-${booking.month_number}-${booking.year}`;
    //     }


    // }
    // if (currentUser?.role === "admin") {
    //     console.log("admin_id being queried:", currentUser.admin_id); // ADD THIS
    // }

    // if (currentUser?.role === "admin") {
    //     const [fetchAdmin, fetchBookings] = await Promise.all([
    //         db.execute(`SELECT * FROM admins WHERE id = ?`, [currentUser.admin_id]),
    //         db.execute(`SELECT bookings.*, treatments.name AS treatment_name, treatments.duration AS treatment_duration FROM bookings LEFT JOIN treatments ON bookings.treatment_id = treatments.id WHERE bookings.admin_id = ? ORDER BY date_number ASC`, [currentUser.admin_id])
    //     ]);

    //     admin = fetchAdmin.rows[0];
    //     allBooking = fetchBookings.rows;

    //     for (const booking of allBooking) {
    //         booking.uniqueKey = `${booking.date_number}-${booking.month_number}-${booking.year}`;
    //     }
    // }

    // const docUniqueBookings = new Set(
    //     (doctorBookings || []).map(fn => fn.uniqueKey)
    // );

    // const allUniqueBookings = new Set(
    //     (allBooking || []).map(fn => fn.uniqueKey)
    // );



    // // console.log("doctor", doctor);
    // // console.log("admin", admin);
    // console.log("doctorBookings", doctorBookings);
    // console.log("allBooking", allBooking);
    // // console.log("docUniqueBookings", docUniqueBookings);
    // // console.log("allUniqueBookings", allUniqueBookings);



    // return (<>
    //     {admin && <AdminComponent />}
    //     {doctor && <DoctorComponent />}
    // </>);
}