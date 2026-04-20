'use client';
import { deleteAccount } from "@/app/lib/deleteAccount";
import Form from "next/form";
import { useActionState, useEffect, useState } from "react";

export default function DeleteClient() {
  const initialState = { ok: null, message: "" };
  const [state, formAction, isPending] = useActionState(deleteAccount, initialState);
  const [serverMessage, setServerMessage] = useState("");
  useEffect(() => { if (state.ok === false) setServerMessage(state.message); }, [state]);
  return (
    <div className="min-h-screen bg-[var(--bg)] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-bold text-[var(--text)] mb-1">Delete Account</h1>
        <p className="font-sans text-sm text-[var(--text-faint)] mb-6 leading-relaxed">This permanently deletes your account and all data. This cannot be undone.</p>
        {serverMessage && (
          <div className="font-sans mb-4 text-sm text-red-700 bg-red-50 border border-red-200 dark:text-red-400 dark:bg-red-950 dark:border-red-800 rounded-lg px-4 py-3">{serverMessage}</div>
        )}
        <Form action={formAction} className="space-y-4">
          <div>
            <label className="block font-sans text-xs text-[var(--text-faint)] uppercase tracking-widest mb-1.5">Confirm Password</label>
            <input type="password" name="password" placeholder="Enter your password" className="w-full font-sans bg-[var(--bg-subtle)] border border-[var(--border)] text-[var(--text)] placeholder-[var(--text-faint)] rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--text)] focus:border-transparent transition-colors" />
          </div>
          <button type="submit" disabled={isPending}
            className="w-full font-sans font-semibold bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white px-6 py-2.5 rounded-full text-sm transition-colors cursor-pointer">
            {isPending ? "Deleting…" : "Delete My Account"}
          </button>
        </Form>
        <a href="/settings" className="block font-sans text-center text-sm text-[var(--text-faint)] hover:text-[var(--text)] transition-colors mt-5">← Back to Settings</a>
      </div>
    </div>
  );
}
