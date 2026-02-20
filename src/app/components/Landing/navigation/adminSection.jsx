import getSession from "@/app/Lib/getSession";
import AdminDropdown from "./adminDropdown"; // client component
import Link from "next/link";
import getUser from "@/app/Lib/getUser";

export default async function AdminSection() {

    const sessionRes = await getSession();
    const userRes = await getUser(sessionRes.session?.user_id);
    const isAdmin = sessionRes?.ok && userRes.user?.role === 'admin' || false;


    if (!isAdmin) return (<Link href={'/login'}>Login</Link>);

    return (
        <>
            {isAdmin && <p>{userRes.user?.username || 'user'}</p>}
            <AdminDropdown username={userRes.user?.username} />
        </>
    )
}