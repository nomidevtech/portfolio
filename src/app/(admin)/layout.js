
export const dynamic = "force-dynamic";
import { redirect } from "next/navigation";
import { adminLoginCheck } from "../Lib/adminLoginCheck";


export default async function AdminLayout({ children }) {

    const isAdmin = await adminLoginCheck();

    if (!isAdmin.ok) { redirect("/login"); }

    return (
        <>
            {children}
        </>
    )
}