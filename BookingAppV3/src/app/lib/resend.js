'use server';

import { fromHyphenSlug } from "@/app/utils/displaySlug";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendEmail({ to, subject, html }) {
    try {
        const response = await resend.emails.send({
            from: "NomiDev <bookings@nomidev.com>",
            to: [to],
            subject,
            html
        });

        return {
            success: true,
            id: response.id
        };

    } catch (error) {
        return {
            success: false,
            error: error.message
        };
    }
}
export async function sendBulkCancelationEmails(payload = {}) {

    if (!payload) return null;

    for (const chunk of Object.keys(payload)) {

        const clause = payload[chunk].map(item => {

            const name = fromHyphenSlug(item.patient_name, "Valued Patient");

            const docName = item.doctor_name
                ? `Dr. ${fromHyphenSlug(item.doctor_name)}`
                : "The Doctor";

            return {
                from: `NomiDev <bookings@nomidev.com>`,
                to: [item.patient_email],
                subject: "Appointment Cancellation",
                html: `
                <p>Dear ${name}</p>
                <p>This is to inform you that your scheduled appointment with ${docName} has been cancelled by the clinic.</p>
                <p>Please Visit our website to schedule another appointment.</p>
                `
            }
        });

        await resend.batch.send(clause);
    }

}