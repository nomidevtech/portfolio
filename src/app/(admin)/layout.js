
export const dynamic = "force-dynamic";
import { redirect } from "next/navigation";
import getSession from "../Lib/getSession";
import getUser from "../Lib/getUser";



export default async function AdminLayout({ children }) {

    const sessionRes = await getSession();
    let isAdmin = false;

    if (sessionRes.ok) {
        const userRes = await getUser(sessionRes.session.user_id);
        isAdmin = userRes.ok && userRes.user?.role === 'admin';
    }

    if (!isAdmin) { redirect("/login"); }

    return (
        <>
            {children}
        </>
    )
}