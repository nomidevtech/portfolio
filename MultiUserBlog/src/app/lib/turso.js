// src/lib/turso.js

import { createClient } from "@libsql/client";

const databaseUrl = process.env.TURSO_DATABASE_URL;

function missingDatabaseClient() {
    return new Proxy({}, {
        get(_target, prop) {
            if (prop === "then") return undefined;
            return () => {
                throw new Error("TURSO_DATABASE_URL is required before database queries can run.");
            };
        },
    });
}

export const db = databaseUrl
    ? createClient({
        url: databaseUrl,
        authToken: process.env.TURSO_AUTH_TOKEN,
    })
    : missingDatabaseClient();
