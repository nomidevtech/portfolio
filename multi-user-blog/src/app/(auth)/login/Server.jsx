import { db } from "@/app/lib/turso";
import Client from "./Client";


export default async function Server({ token }) {

    const result = await db.execute(
        `SELECT users.name, users.email, users.username
         FROM sessions
         LEFT JOIN users ON sessions.user_id = users.id
         WHERE sessions.session_id = ?
         LIMIT 1`,
        [token]
    );

    if (result.rows.length === 0) {
        return (
            <Client />
        );
    }

    const user = result.rows[0];

    return (
        <div className="min-h-screen bg-zinc-950 flex items-center justify-center px-4">
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 w-full max-w-sm shadow-xl">

                {/* Avatar placeholder */}
                <div className="w-14 h-14 rounded-full bg-zinc-700 flex items-center justify-center mb-5">
                    <span className="text-white text-xl font-bold uppercase">
                        {user.name?.[0] ?? "?"}
                    </span>
                </div>

                <h2 className="text-white text-xl font-semibold mb-1">{user.name}</h2>
                <p className="text-zinc-500 text-xs uppercase tracking-widest mb-5">
                    Logged in
                </p>

                <div className="flex flex-col gap-3 mb-6">
                    <div className="bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3">
                        <p className="text-zinc-500 text-xs uppercase tracking-widest mb-0.5">Email</p>
                        <p className="text-white text-sm">{user.email}</p>
                    </div>
                    <div className="bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3">
                        <p className="text-zinc-500 text-xs uppercase tracking-widest mb-0.5">Username</p>
                        <p className="text-white text-sm">@{user.username}</p>
                    </div>
                </div>

                {/* Logout via server action */}
                <form action={logoutSA}>
                    <button
                        type="submit"
                        className="w-full bg-zinc-800 text-zinc-300 border border-zinc-700 font-medium rounded-lg py-2.5 text-sm hover:bg-red-950 hover:text-red-400 hover:border-red-800 transition-colors"
                    >
                        Sign out
                    </button>
                </form>

            </div>
        </div>
    );
}
