import { headers } from "next/headers";
import { redis } from "../lib/redis";

export async function redisIpLimit(incomingLimit, _for) {
    try {
        let limit = parseInt(incomingLimit);
        if (isNaN(limit) || limit <= 0) {
            limit = 5;
        }

        const identifier = _for || "default_action";

        const headerStore = await headers();
        const rawIp = headerStore.get("x-forwarded-for");
        const ip = rawIp?.split(",")[0].trim() || "127.0.0.1";

        const key = `limit:${identifier}:${ip}`;
        const windowInSeconds = 60 * 15;

        let attempts = parseInt(await redis.get(key)) || 0;

        if (attempts >= limit) {
            return {
                ok: false,
                message: `Too many ${identifier.replace("_", " ")} attempts. Try again later.`
            };
        }

        attempts = await redis.incr(key);
        if (attempts === 1) {
            await redis.expire(key, windowInSeconds);
        }

        return { ok: true, message: `${limit - attempts} attempts left` };

    } catch (error) {
        console.error(error);
        return { ok: false, message: "An error occurred" };
    }
}