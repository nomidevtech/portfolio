'use client'
import { useState, useRef, startTransition, useActionState } from "react";
import { searchServerAction } from "../authors/SSA";
import Link from "next/link";

export default function SearchBar() {

    const initialState = { ok: null, postTitlesArr: [], message: "" };

    const [state, formAction, isPending] = useActionState(searchServerAction, initialState);
    const [inputValue, setInputValue] = useState("");
    const timeoutRef = useRef(null);

    const handleInput = (e) => {
        const value = e.target.value;
        setInputValue(value);

        if (timeoutRef.current) clearTimeout(timeoutRef.current);

        timeoutRef.current = setTimeout(() => {
            startTransition(() => {
                formAction(value);
            });
        }, 500);
    };

    return (
        <div className="relative w-full max-w-md">
            <input
                type="text"
                placeholder="Search..."
                value={inputValue}
                onChange={handleInput}
                className="w-full border rounded px-3 py-2"
            />

            {isPending && (
                <div className="absolute top-full left-0 w-full bg-white border rounded mt-1 p-2">
                    <p>Searching...</p>
                </div>
            )}

            {!isPending && state?.postTitlesArr?.length > 0 && (
                <div className="absolute top-full left-0 w-full bg-white border rounded mt-1 p-2 z-10">
                    <ul>
                        {state.postTitlesArr.map((post) => (
                            <li key={post.ppid} className="py-1">
                                <Link href={`/post/${post.slug}/${post.ppid}`}>
                                    {post.title}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {!isPending && inputValue.trim() !== "" && state?.postTitlesArr?.length === 0 && (
                <div className="absolute top-full left-0 w-full bg-white border rounded mt-1 p-2">
                    <p>No results</p>
                </div>
            )}
        </div>
    );
}