import { getSession } from "@/app/utils/getSession";
import Client from "./Client";
import Server from "./Server";
import { Suspense } from "react";

export default async function Login() {

    const isSession = await getSession("mub-session-token");

    if (isSession) {
        return (
            <Suspense fallback={
                <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
                    <p className="text-zinc-500 text-sm animate-pulse">Loading…</p>
                </div>
            }>
                <Server token={isSession} />
            </Suspense>
        );
    }

    return (
        <Client />
    );
}
