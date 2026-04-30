'use server';

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