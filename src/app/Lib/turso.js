import { createClient } from "@libsql/client";

const TURSO_URL = process.env.TURSO_URL;

export const db = createClient({
    url: TURSO_URL
});

export async function testConnection() {
  try {
    await db.execute(`SELECT 1;`);
    return '✅ Turso connection works!';
  } catch (err) {
    console.error(err);
    return `❌ Connection failed: ${err.message}`;
  }
}