'use client';
import Link from "next/link";
import { useState } from "react";

export default function SideNav({ user }) {

    const [open, setOpen] = useState(false);


    return (<>
        {open &&
            <aside className="w-85 border-amber-900 border-2 h-screen fixed z-50 bg-gray-600 shadow-lg  p-4">
                <button className="absolute top-2 right-2" onClick={() => setOpen(false)}>⬅</button>
                <div className="flex flex-col justify-between h-full">
                    <ul className="flex flex-col gap-2">
                        <Link href="/add-doctor"><li>Add Doctor</li></Link>
                        <Link href="/edit-doctor"><li>Edit Doctor</li></Link>
                        <Link href="/add-treatment"><li>Add Treatment</li></Link>
                        <Link href="/create-template"><li> Create Template</li></Link>
                        <Link href="/edit-template"><li> Edit Template</li></Link>
                        <Link href="/manage-generated-slots"><li> Manage Generated Slots</li></Link>
                        <Link href="/bookings"><li> Book A Slot</li></Link>
                        <Link href="/signup"><li> Sign Up</li></Link>
                        <Link href="/login"><li>Login</li></Link>
                        <Link href="/dashboard"><li>Dashboard</li></Link>
                    </ul>
                    <div className="flex justify-between mb-10 items-center">
                        <div className="flex items-center gap-2">
                            <p className="w-10 h-10 rounded-full bg-gray-800 text-white flex items-center justify-center text-sm font-semibold">{user?.name?.[0]?.toUpperCase() || "?"}</p>
                            <p>{user?.name ? user.name.split(" ").map(word => word[0].toUpperCase() + word.slice(1)).join(" ") : ""} ({user?.role ? user.role[0].toUpperCase() + user.role.slice(1) : ""})</p>
                        </div>
                        <Link href="/">Logout</Link>
                    </div>
                </div>
            </aside>}
        <button onClick={() => setOpen(true)}>➡</button>
    </>);
}
