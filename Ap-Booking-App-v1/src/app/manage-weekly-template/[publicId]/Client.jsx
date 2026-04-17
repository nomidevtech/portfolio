"use client"; // 1. Added the missing directive

import Link from "next/link";
import Form from "next/form";
import { useRouter } from 'next/navigation'
import { useActionState, useEffect, useState } from "react";
import { minutesToMeridiem } from "../../utils/minutes-to-meridiem";
import { toggleTemplateStatusServerAction } from "./deactivateSA";




export default function Client({ templates, publicId, bookings }) {
    

    const router = useRouter();

    const handleDeactivate = () => {
        router.refresh();
    }

    if (templates.length === 0) return <p>No templates found.</p>;

    return (
        <>
            {templates.map((template) => (
                <TemplateItem
                    key={template.public_id}
                    template={template}
                    bookings={bookings}
                    publicId={publicId}
                    handleDeactivate={handleDeactivate}
                />
            ))}
        </>
    );
}





function TemplateItem({ template, bookings, publicId, handleDeactivate }) {

    const [state, action, inPending] = useActionState(toggleTemplateStatusServerAction, { ok: false, message: "" });
    const [deactivate, setDeactivate] = useState(false);
    useEffect(() => {
        if (state.ok) {
            handleDeactivate();
            setDeactivate(false);
        }
    }, [state]);



    const bookingCount = bookings.length > 0
        ? bookings.filter(b => b.date === template.date).length
        : 0;

    return (
        <div className="border-2">
            <p>{template.day[0].toUpperCase() + template.day.slice(1)}</p>
            <p>
                {template.month_name[0].toUpperCase() + template.month_name.slice(1)} {template.date < 10 ? "0" + template.date : template.date}
            </p>
            <p>Status: {template.status === 0 ? "Inactive" : "Active"}</p>
            <p>Clinic: {minutesToMeridiem(template.start_time, true)} - {minutesToMeridiem(template.end_time, true)}</p>
            <p>Break: {minutesToMeridiem(template.break_start, true)} - {minutesToMeridiem(template.break_end, true)}</p>
            <p>Buffer: {template.buffer_minutes} Minutes</p>
            <p>Bookings: {bookingCount}</p>

            <Link href={`/edit-weekly-template/${template.public_id}/`}>Edit</Link>

            {template.status === 1 && <button onClick={() => setDeactivate(true)}>Deactivate</button>}
            {template.status === 0 && <>
                <Form action={action}>
                    <input type="hidden" name="public_id" value={template.public_id} />
                    <button type="submit">Activate</button>
                </Form>
            </>}

            {deactivate && (
                <div >
                    {bookingCount > 0 && <p>There are {bookingCount} bookings for this template. Patients will be notied to book again.</p>}
                    <Form action={action}>
                        <p>Are you sure?</p>
                        <input type="hidden" name="public_id" value={template.public_id} />
                        <button type="submit">Yes</button>
                        <button type="button" onClick={() => setDeactivate(false)}>Cancel</button>
                    </Form>
                </div>
            )}
        </div>
    );
}
