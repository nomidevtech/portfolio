import { db } from "@/app/lib/turso";
import Form from "next/form";
import { appointmentRegisterationServerAction } from "./sa";

export default async function AppointmentRegisteration({ params }) {

    const { bookingPubId } = await params;
    if (!bookingPubId) return <p>Broken link. Booking not found.</p>;

    const fetchBooking = await db.execute(`SELECT * FROM bookings WHERE public_id = ?`, [bookingPubId]);
    if (fetchBooking.rows.length === 0) return <p>Broken link. Booking not found.</p>;

    return (<>
        <Form action={appointmentRegisterationServerAction} >
            <input type="hidden" name="bookingPubId" value={bookingPubId} />
            <input type="text" name="name" placeholder="Name" />
            <input type="email" name="email" placeholder="example@ex.com" />
            <input type="text" name="phone" placeholder="Phone Number" />
            <button type="submit" className="btn btn-primary">Register⬅</button>
        </Form>
    </>);
}