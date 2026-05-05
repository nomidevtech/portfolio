"use server";

import { sendBulkCancelationEmails } from "./resend";

export async function sendCancelationEmails(payload = [], chunkSize = 100) {
    try {
        const segmentizedPayload = segmentizeBulkEmails(payload, chunkSize);
        await sendBulkCancelationEmails(segmentizedPayload);
    }
    catch (error) {
        console.error(error);
        return null
    }
}




function segmentizeBulkEmails(realPayload, chunkSize) {
    try {
        const dummyObj = {};

        for (let i = 0; i < realPayload.length; i += chunkSize) {

            const chunk = realPayload.slice(i, i + chunkSize);

            dummyObj[`${chunkSize + i}`] = chunk
        }

        //console.dir(dummyObj, { depth: null });

        return dummyObj;

    } catch (error) {
        console.log(error);
        return null
    }
}