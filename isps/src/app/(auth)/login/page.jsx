import { db } from "@/app/lib/turso";
import Client from "./Client";
import { logout } from "@/app/lib/logout";
import { initSessionsTable } from "@/app/models/table-inits";
import { cookies } from "next/headers";


export default async function Login() {

    const cookieStore = await cookies();
    const token = cookieStore.get('mub-session-token');

    if (!token) return <Client />

    let result;
    if (token) {
        await initSessionsTable();
        result = await db.execute(
            `SELECT admins.username
             FROM sessions
             LEFT JOIN admins ON sessions.admin_id = admins.id
             WHERE sessions.session_id = ?
             LIMIT 1`,
            [token]
        );
    }

    if (result?.rows?.length === 0) return <Client />

    const user = result?.rows[0];

    return (
        <div className="min-h-screen bg-zinc-950 flex items-center justify-center px-4">
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 w-full max-w-sm shadow-xl">

                <div className="w-14 h-14 rounded-full bg-zinc-700 flex items-center justify-center mb-5">
                    <span className="text-white text-xl font-bold uppercase">
                        {user?.name?.[0] ?? "?"}
                    </span>
                </div>

                <h2 className="text-white text-xl font-semibold mb-1">{user?.name}</h2>
                <p className="text-zinc-500 text-xs uppercase tracking-widest mb-5">
                    Logged in
                </p>

                <div className="flex flex-col gap-3 mb-6">
                    <div className="bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3">
                        <p className="text-zinc-500 text-xs uppercase tracking-widest mb-0.5">Email</p>
                        <p className="text-white text-sm">{user?.email}</p>
                    </div>
                    <div className="bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3">
                        <p className="text-zinc-500 text-xs uppercase tracking-widest mb-0.5">Username</p>
                        <p className="text-white text-sm">@{user?.username}</p>
                    </div>
                </div>

                <form action={logout}>
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
