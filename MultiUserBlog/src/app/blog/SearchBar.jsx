'use client'
import { useState, useRef, startTransition, useActionState } from "react";
import { searchServerAction } from "./SSA";
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
    timeoutRef.current = setTimeout(() => startTransition(() => formAction(value)), 500);
  };

  return (
    <div className="relative w-full sm:w-72">
      <div className="relative">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--text-faint)] pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="search"
          placeholder="Search posts"
          value={inputValue}
          onChange={handleInput}
          className="w-full font-sans bg-[var(--bg-raised)] border border-[var(--border)] text-[var(--text)] placeholder-[var(--text-faint)] rounded-md pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent transition-all"
        />
      </div>
      {inputValue.trim() !== "" && (
        <div className="absolute top-full left-0 w-full bg-[var(--bg-raised)] border border-[var(--border)] rounded-lg mt-1.5 shadow-[var(--shadow)] z-20 overflow-hidden">
          {isPending
            ? <p className="font-sans px-4 py-3 text-sm text-[var(--text-faint)]">Searching...</p>
            : state?.postTitlesArr?.length > 0
              ? <ul className="py-1">{state.postTitlesArr.map(post => (
                  <li key={post.ppid}>
                    <Link href={`/post/${post.slug}/${post.ppid}`}
                      className="block font-sans px-4 py-2.5 text-sm text-[var(--text-muted)] hover:bg-[var(--bg-subtle)] hover:text-[var(--text)] transition-colors">
                      {post.title}
                    </Link>
                  </li>
                ))}</ul>
              : <p className="font-sans px-4 py-3 text-sm text-[var(--text-faint)]">No results found</p>
          }
        </div>
      )}
    </div>
  );
}
