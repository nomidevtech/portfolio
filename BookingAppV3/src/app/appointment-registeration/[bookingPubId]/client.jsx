'use client';

import Form from "next/form";
import { appointmentRegisterationServerAction } from "./sa";
import { useActionState } from "react";

export default function ClientAppointmentRegisteration({ bookingPubId }) {

    const [state, action, isPending] = useActionState(appointmentRegisterationServerAction, { ok: null, message: null });

    return (<>
        <Form action={action} >
            <input type="hidden" name="bookingPubId" value={bookingPubId} />
            <input type="text" name="name" placeholder="Name" />
            <input type="email" name="email" placeholder="example@ex.com" />
            <input type="text" name="phone" placeholder="Phone Number" />
            <button type="submit" className="btn btn-primary">Register⬅</button>
        </Form>
        {state.message && <p>{state.message}</p>}
    </>);
}