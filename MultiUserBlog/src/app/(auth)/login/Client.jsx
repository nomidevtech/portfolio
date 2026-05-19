"use client";
import Form from "next/form";
import Link from "next/link";
import { loginSA } from "./loginSA";
import { useActionState } from "react";

export default function Client() {
  const initialState = { ok: null, message: "" };
  const [state, formAction, isPending] = useActionState(loginSA, initialState);
  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-[var(--bg)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <p className="font-sans text-xs uppercase tracking-widest text-[var(--accent)] mb-3">Inkline</p>
        <h1 className="text-2xl font-bold text-[var(--text)] mb-1">Welcome back</h1>
        <p className="font-sans text-sm text-[var(--text-faint)] mb-7">Sign in to continue writing and saving posts.</p>
        <Form action={formAction} className="space-y-4">
          <div>
            <label className="block font-sans text-xs text-[var(--text-faint)] uppercase tracking-widest mb-1.5">Username or email</label>
            <input name="username_or_email" type="text" placeholder="you@example.com" className="w-full font-sans bg-[var(--bg-raised)] border border-[var(--border)] text-[var(--text)] placeholder-[var(--text-faint)] rounded-md px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent transition-colors" />
          </div>
          <div>
            <label className="block font-sans text-xs text-[var(--text-faint)] uppercase tracking-widest mb-1.5">Password</label>
            <input name="password" type="password" placeholder="Enter your password" className="w-full font-sans bg-[var(--bg-raised)] border border-[var(--border)] text-[var(--text)] placeholder-[var(--text-faint)] rounded-md px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent transition-colors" />
          </div>
          {state?.message && (
            <p className={`font-sans text-sm px-4 py-2.5 rounded-md border ${state.ok ? "text-green-700 bg-green-50 border-green-200 dark:text-green-400 dark:bg-green-950 dark:border-green-800" : "text-red-700 bg-red-50 border-red-200 dark:text-red-400 dark:bg-red-950 dark:border-red-800"}`}>
              {state.ok ? "Login successful. Redirecting..." : state.message}
            </p>
          )}
          <button type="submit" disabled={isPending} className="font-sans font-semibold bg-[var(--text)] text-[var(--bg)] px-6 py-2.5 rounded-md text-sm hover:opacity-85 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity cursor-pointer w-full mt-1">
            {isPending ? "Signing in..." : "Sign in"}
          </button>
        </Form>
        <p className="font-sans text-sm text-[var(--text-faint)] text-center mt-6">
          No account? <Link href="/sign-up" className="text-[var(--text)] underline underline-offset-4 hover:text-[var(--accent)] transition-colors">Sign up</Link>
        </p>
      </div>
    </div>
  );
}
