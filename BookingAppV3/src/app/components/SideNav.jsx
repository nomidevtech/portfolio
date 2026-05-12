'use client';
import Link from "next/link";
import { useState } from "react";
import { logout } from "../lib/logout";
import Form from "next/form";

export default function SideNav({ user }) {
    const [open, setOpen] = useState(false);

    return (
        <>
            {open && (
                <aside className="w-85 border-amber-900 border-2 h-screen fixed top-0 left-0 z-50 bg-gray-600 shadow-lg p-4">
                    <button className="absolute top-2 right-2" onClick={() => setOpen(false)}>⬅</button>
                    <div className="flex flex-col justify-between h-full">
                        <ul className="flex flex-col gap-2">
                            <li><Link href="/dashboard">Dashboard</Link></li>
                            <li><Link href="/appointments">{user?.role === "admin" ? "Appointments" : "My Appointments"}</Link></li>
                            {user?.role === "admin" && (
                                <>
                                    <li><Link href="/add-doctor">Add Doctor</Link></li>
                                    <li><Link href="/edit-doctor">Edit Doctor</Link></li>
                                    <li><Link href="/add-treatment">Add Treatment</Link></li>
                                    <li><Link href="/create-template">Create Template</Link></li>
                                    <li><Link href="/edit-template">Edit Template</Link></li>
                                    <li><Link href="/manage-generated-slots">Manage Generated Slots</Link></li>
                                </>
                            )}
                            <li><Link href="/settings">Settings</Link></li>
                        </ul>
                        <div className="flex justify-between mb-10 items-center">
                            <div className="flex items-center gap-2">
                                <p className="w-10 h-10 rounded-full bg-gray-800 text-white flex items-center justify-center text-sm font-semibold">
                                    {user?.name?.[0]?.toUpperCase() || "?"}
                                </p>
                                <p>
                                    {user?.name ? user.name.split("-").map(word => word[0].toUpperCase() + word.slice(1)).join(" ") : ""} ({user?.role ? user.role[0].toUpperCase() + user.role.slice(1) : ""})
                                </p>
                            </div>
                            <Form action={logout}>
                                <button type="submit">Logout</button>
                            </Form>
                        </div>
                    </div>
                </aside>
            )}
            <button onClick={() => setOpen(true)}>➡</button>
        </>
    );
}