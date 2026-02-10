import { adminLoginCheck } from "@/app/Lib/adminLoginCheck"
import AdminDropdown from "./adminDropdown"; // client component
import Link from "next/link";

export default async function AdminSection() {

    const isAdmin = await adminLoginCheck();

    if (!isAdmin.ok) return (<Link href={'/login'}>Login</Link>);

    const username = isAdmin.username

    return (
        <AdminDropdown username={username} />
    )
}