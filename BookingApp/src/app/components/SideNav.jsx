'use client';

import Link from "next/link";
import { useState } from "react";
import { capitalizeLabel, fromHyphenSlug } from "@/app/utils/displaySlug";
import { logout } from "../lib/logout";
import Form from "next/form";

export default function SideNav({ user }) {
    const [open, setOpen] = useState(false);
    const displayName = fromHyphenSlug(user?.name);
    const role = capitalizeLabel(user?.role);
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
                            <button className="btn-ghost p-2" aria-label="Close menu" onClick={() => setOpen(false)}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <line x1="18" y1="6" x2="6" y2="18" />
                                    <line x1="6" y1="6" x2="18" y2="18" />
                                </svg>
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
            <button className="btn-ghost p-2" aria-label="Open menu" onClick={() => setOpen(true)}>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="4" y1="6" x2="20" y2="6" />
                    <line x1="4" y1="12" x2="20" y2="12" />
                    <line x1="4" y1="18" x2="20" y2="18" />
                </svg>
            </button>
        </>
    );
}
