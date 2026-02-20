import { createClient } from "@libsql/client";

const TURSO_URL = process.env.TURSO_URL;
const TURSO_AUTH_TOKEN = process.env.TURSO_AUTH_TOKEN;

console.log("TURSO_URL:", process.env.TURSO_URL);
console.log("TURSO_AUTH_TOKEN:", process.env.TURSO_AUTH_TOKEN);


export const db = createClient({
    url: TURSO_URL,
    authToken: TURSO_AUTH_TOKEN
});

// export async function testConnection() {
//   try {
//     await db.execute(`SELECT 1;`);
//     return '✅ Turso connection works!';
//   } catch (err) {
//     console.error(err);
//     return `❌ Connection failed: ${err.message}`;
//   }
// }