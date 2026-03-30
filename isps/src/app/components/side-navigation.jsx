"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navLinks = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Projects", href: "/projects" },
    { label: "Clients", href: "/clients" },
    { label: "Invoices", href: "/invoices" },
    { label: "Settings", href: "/settings" },
];

export default function Sidebar() {
    const pathname = usePathname();

    return (
        <aside className="w-56 min-h-screen border-r border-gray-200 bg-white">
            {/* Brand / Logo area */}
            <div className="h-14 flex items-center px-4 border-b border-gray-200">
                <span className="font-semibold text-gray-800">MyApp</span>
            </div>

            {/* Nav links */}
            <nav className="flex flex-col gap-1 p-3">
                {navLinks.map((link) => {
                    const isActive = pathname === link.href;

                    return (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={`px-3 py-2 rounded text-sm font-medium transition-colors
                ${isActive
                                    ? "bg-gray-100 text-gray-900"
                                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                                }`}
                        >
                            {link.label}
                        </Link>
                    );
                })}
            </nav>
        </aside>
    );
}