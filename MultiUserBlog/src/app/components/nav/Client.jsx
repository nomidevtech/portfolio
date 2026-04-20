"use client";
import { useState } from "react";
import Link from "next/link";
import Form from "next/form";
import { logout } from "@/app/lib/logout";
import ThemeToggle from "@/app/components/ThemeToggle";

export default function NavBarClient({ serializedUser }) {
  const [isOpen, setIsOpen] = useState(false);
  const user = JSON.parse(serializedUser);

  return (
    <nav className="border-b border-[var(--border)] bg-[var(--bg)]">
      {/* Top bar */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between h-14">
        <Link href="/" className="font-bold text-xl tracking-tight text-[var(--text)] hover:text-[var(--accent)] transition-colors font-serif">
          MyApp
        </Link>

        <div className="flex items-center gap-3">
          <Link href="/blog" className="text-sm text-[var(--text-muted)] hover:text-[var(--text)] transition-colors hidden sm:block">
            Blog
          </Link>

          <ThemeToggle />

          {!user ? (
            <Link href="/login" className="text-sm font-semibold text-[var(--bg)] bg-[var(--text)] px-4 py-1.5 rounded-full hover:opacity-80 transition-opacity">
              Login
            </Link>
          ) : (
            <div className="relative">
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 text-sm text-[var(--text-muted)] hover:text-[var(--text)] transition-colors cursor-pointer"
              >
                <span className="w-7 h-7 rounded-full bg-[var(--accent)] flex items-center justify-center text-xs font-bold text-white uppercase">
                  {user.name?.[0] || "U"}
                </span>
                <svg className={`w-3 h-3 transition-transform ${isOpen ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {isOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
                  <div className="absolute right-0 top-full mt-2 w-52 bg-[var(--bg)] border border-[var(--border)] rounded-xl shadow-lg z-20 overflow-hidden">
                    <div className="px-4 py-3 border-b border-[var(--border)]">
                      <p className="text-sm font-semibold text-[var(--text)]">{user.name}</p>
                      <p className="text-xs text-[var(--text-faint)]">@{user.username}</p>
                    </div>
                    <div className="py-1">
                      {[["Add Post","/add-post"],["My Posts","/my-posts"],["Favorites","/favorites"],["Settings","/settings"]].map(([label, href]) => (
                        <Link key={href} href={href} onClick={() => setIsOpen(false)}
                          className="block px-4 py-2 text-sm text-[var(--text-muted)] hover:bg-[var(--bg-subtle)] hover:text-[var(--text)] transition-colors">
                          {label}
                        </Link>
                      ))}
                    </div>
                    <div className="border-t border-[var(--border)] py-1">
                      <Form action={logout}>
                        <button type="submit" className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-[var(--bg-subtle)] transition-colors cursor-pointer">
                          Logout
                        </button>
                      </Form>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
