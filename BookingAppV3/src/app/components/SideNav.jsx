'use client';

import Link from "next/link";
import { useState } from "react";
import { logout } from "../lib/logout";
import Form from "next/form";

export default function SideNav({ user }) {
    const [open, setOpen] = useState(false);
    const displayName = user?.name ? user.name.split("-").map(word => word[0].toUpperCase() + word.slice(1)).join(" ") : "";
    const role = user?.role ? user.role[0].toUpperCase() + user.role.slice(1) : "";
    const navItems = [
        { href: "/dashboard", label: "Dashboard" },
        { href: "/appointments", label: user?.role === "admin" ? "Appointments" : "My Appointments" },
        ...(user?.role === "admin"
            ? [
                { href: "/add-doctor", label: "Add Doctor" },
                { href: "/edit-doctor", label: "Edit Doctor" },
                { href: "/add-treatment", label: "Add Treatment" },
                { href: "/create-template", label: "Create Template" },
                { href: "/edit-template", label: "Edit Template" },
                { href: "/manage-generated-slots", label: "Generated Slots" },
            ]
            : []),
        { href: "/settings", label: "Settings" },
    ];

    return (
        <>
            {open && (
                <div className="fixed inset-0 z-50">
                    <button
                        className="absolute inset-0 h-full w-full rounded-none bg-slate-950/35 p-0"
                        aria-label="Close menu"
                        onClick={() => setOpen(false)}
                    />
                    <aside className="relative flex h-screen w-[min(22rem,90vw)] flex-col border-r border-emerald-100 bg-white p-5 shadow-2xl">
                        <div className="mb-6 flex items-center justify-between">
                            <div>
                                <p className="text-xs font-bold uppercase text-teal-700">ClinicFlow</p>
                                <p className="text-lg font-bold text-slate-950">Workspace</p>
                            </div>
                            <button className="btn-ghost px-3" aria-label="Close menu" onClick={() => setOpen(false)}>
                                Close
                            </button>
                        </div>

                        <ul className="grid gap-1">
                            {navItems.map((item) => (
                                <li key={item.href}>
                                    <Link
                                        href={item.href}
                                        className="flex rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-700 hover:bg-emerald-50 hover:text-teal-800"
                                        onClick={() => setOpen(false)}
                                    >
                                        {item.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>

                        <div className="mt-auto rounded-2xl border border-emerald-100 bg-emerald-50 p-4">
                            <div className="flex items-center gap-3">
                                <p className="flex h-10 w-10 items-center justify-center rounded-full bg-teal-700 text-sm font-semibold text-white">
                                    {user?.name?.[0]?.toUpperCase() || "?"}
                                </p>
                                <div>
                                    <p className="text-sm font-bold text-slate-950">{displayName}</p>
                                    <p className="text-xs font-semibold uppercase text-slate-500">{role}</p>
                                </div>
                            </div>
                            <Form action={logout}>
                                <button type="submit" className="btn-secondary mt-4 w-full">Logout</button>
                            </Form>
                        </div>
                    </aside>
                </div>
            )}
            <button className="btn-ghost px-3" aria-label="Open menu" onClick={() => setOpen(true)}>
                Menu
            </button>
        </>
    );
}
