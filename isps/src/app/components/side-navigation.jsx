"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const navLinks = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Collect Fees", href: "/fee-submit" },
    { label: "Add User", href: "/add-user" },
    { label: "Edit User", href: "/edit-user" },
    { label: "Manage Plans", href: "/plans" },
    { label: "Settings", href: "/settings" },
    { label: "Bulk Adding", href: "/bulk" },

];

export default function Sidebar() {
    const pathname = usePathname();
    const [open, setOpen] = useState(true);

    return (
        <aside className={`min-h-screen border-r border-gray-200 ${open ? "w-48" : "w-10"}`}>

            <button onClick={() => setOpen(!open)} className="p-3 text-sm whitespace-nowrap">
                {open ? "✕" : "☰"}
            </button>

            {open && (
                <nav className="flex flex-col">
                    {navLinks.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={`px-4 py-2 text-sm ${pathname === link.href
                                ? "font-semibold text-black"
                                : "text-gray-500"
                                }`}
                        >
                            {link.label}
                        </Link>
                    ))}
                </nav>
            )}

        </aside>
    );
}