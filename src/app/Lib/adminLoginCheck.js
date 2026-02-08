'use server'

import { sessionValidation } from "./sessionValidation";

const adminLoginCheck = async (cookieToken) => {
    const sessionResult = await sessionValidation(cookieToken);

    if (!sessionResult.ok) {
        return sessionResult;
    }

    const user = sessionResult.user;

    if (user.role !== "admin") {
        return { ok: false, message: "admin not found" };
    }

    return { ok: true, message: "Admin verified", /*user*/ };
};

export { adminLoginCheck };