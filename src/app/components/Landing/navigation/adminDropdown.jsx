"use client";

import { useState } from "react";
import Link from "next/link";
import { logout } from "@/app/Lib/logout"; // Ensure this matches your path

export default function AdminDropdown({ username }) {
    const [open, setOpen] = useState(false);

    const handleToggle = () => setOpen(prev => !prev);

    return (
        <div className="relative inline-block text-left">
            {/* Username button */}
            <button
                onClick={handleToggle}
                className="px-4 py-2 font-medium rounded bg-(--primary) text-(--primary-foreground) hover:bg-(--primary-hover) hover:text-(--primary-hover-foreground) transition-colors"
            >
                {username} ▼
            </button>

            {/* Dropdown */}
            {open && (
                <div
                    className="absolute right-0 mt-2 w-48 bg-(--surface) text-(--surface-foreground) shadow-lg rounded-md ring-1 ring-black ring-opacity-5 focus:outline-none z-50"
                >
                    <div className="py-1 flex flex-col">
                        <Link
                            href="/add-post"
                            className="px-4 py-2 hover:bg-(--secondary) hover:text-(--secondary-foreground) transition-colors"
                            onClick={() => setOpen(false)}
                        >
                            Add Post
                        </Link>
                        <Link
                            href="/dashboard"
                            className="px-4 py-2 hover:bg-(--secondary) hover:text-(--secondary-foreground) transition-colors"
                            onClick={() => setOpen(false)}
                        >
                            Dashboard
                        </Link>

                        {/* 1. Use standard lowercase <form> */}
                        {/* 2. Removed setOpen(false) from button to prevent request cancellation */}
                        <form action={logout}>
                            <button
                                type="submit"
                                className="w-full text-left px-4 py-2 hover:bg-(--secondary) hover:text-(--secondary-foreground) transition-colors"
                            >
                                Logout
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}