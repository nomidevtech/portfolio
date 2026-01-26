"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export default function ThemeToggle() {
    const { resolvedTheme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    return (
        <label className="flex gap-2 items-center cursor-pointer text-[16px] justify-between">
            <span className="">
                Theme
            </span>
            <input
                type="checkbox"
                className="sr-only peer"
                checked={resolvedTheme === "dark"}
                onChange={(e) =>
                    setTheme(e.target.checked ? "dark" : "light")
                }
            />

            <div
                className="
        relative w-9 h-5 
        rounded-full 
        bg-primary 
        /* Change peer-focus to peer-focus-visible */
        peer-focus-visible:outline-none 
        peer-focus-visible:ring-2 
        peer-focus-visible:ring-primary-hover
        /* Rest of your styles */
        after:content-[''] after:absolute after:top-0.5 after:start-0.5 
        after:bg-primary-foreground after:rounded-full after:h-4 after:w-4 after:transition-all
        peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full
        peer-checked:bg-primary-hover
        peer-checked:after:bg-primary-hover-foreground
    "
            ></div>


        </label>
    );
}
