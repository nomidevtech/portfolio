import { Redis } from "@upstash/redis";
import { headers } from "next/headers";

export const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN
});

export async function redisIpLimit(
    incomingLimit,
    _for,
    windowInSeconds = 60 * 15
) {

    try {

        let limit = parseInt(incomingLimit);

        if (isNaN(limit) || limit <= 0) {
            limit = 5;
        }

        const identifier = _for || "default_action";

        const headerStore = await headers();
        const rawIp = headerStore.get("x-forwarded-for");
        const ip = rawIp?.split(",")[0].trim() || "unknown";
        const key = `limit:${identifier}:${ip}`;

        const attempts = await redis.incr(key);

        if (attempts === 1) {
            await redis.expire(key, windowInSeconds);
        }

        if (attempts > limit) {

            return {
                ok: false,
                message: `Too many ${identifier.replaceAll("_", " ")} attempts. Try again later.`
            };
        }

        return {
            ok: true,
            message: `${limit - attempts} attempts left`
        };

    } catch (error) {

        console.error(error);
        // ok is true to prevent app lock in case of redis network or any other error
        return { ok: true, message: "Rate limit check skipped" };
    }
}