import { db } from "@/app/lib/turso";
import { compare } from "@/app/utils/bcrypt";

export default async function Verify({ searchParams }) {
    const { token, pid } = await searchParams;

    if (!token || !pid) {
        return <p>Failed to Verify. Please try again or request a new verification link.</p>
    }


    try {

        const userRes = await db.execute('SELECT email_verified, email_token FROM users WHERE public_id = ?', [pid]);
        const user = userRes.rows[0];

        if (!user) return <p>Invalid verification link.</p>


        if (user.email_verified === 1) {
            return <div className="min-h-screen bg-zinc-950 flex items-center justify-center px-4">
                <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 text-center">
                    <p className="text-green-400 text-sm">Email is already verified. Close this window.</p>
                </div>
            </div>
        }

        const isValid = await compare(token, user.email_token);
        if (!isValid) {
            return <p>Failed to verify. Invalid or expired token.</p>
        }

        // Mark verified & remove token atomically
        await db.execute(
            `UPDATE users SET email_verified = 1, email_token = NULL WHERE public_id = ?`,
            [pid]
        );

        return (
            <div className="min-h-screen bg-zinc-950 flex items-center justify-center px-4">
                <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 text-center">
                    <p className="text-green-400 text-sm">Email verified successfully! Close this window.</p>
                </div>
            </div>
        );
    } catch (err) {
        console.error(err);
        return <p>Unexpected error. Please try again later.</p>
    }
}