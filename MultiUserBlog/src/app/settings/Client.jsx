"use client";
import { startTransition, useActionState, useState } from "react";
import { updateUserSA } from "./SA";
import Form from "next/form";
import { checkUsername } from "../lib/checkUsername";
import { checkEmail } from "../lib/checkEmail";
import { emailOrchestrator } from "../lib/resend";
import Link from "next/link";
import { logout } from "../lib/logout";

const IC = "w-full font-sans bg-[var(--bg-subtle)] border border-[var(--border)] text-[var(--text)] placeholder-[var(--text-faint)] rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--text)] focus:border-transparent transition-colors";
const LC = "block font-sans text-xs text-[var(--text-faint)] uppercase tracking-widest mb-1.5";

export default function SettingsForm({ serializedUser }) {
  const initialState = { success: null, message: "" };
  const [state, formAction, isPending] = useActionState(updateUserSA, initialState);
  const [usernameState, usernameAction, usernamePending] = useActionState(checkUsername, initialState);
  const [emailState, emailAction, emailPending] = useActionState(checkEmail, initialState);
  const [sent, setSent] = useState(false);
  const user = JSON.parse(serializedUser);
  const isVerified = user.email_verified === 1;

  const msgCls = (ok) => `font-sans text-sm px-4 py-2.5 rounded-lg border ${ok ? "text-green-700 bg-green-50 border-green-200 dark:text-green-400 dark:bg-green-950 dark:border-green-800" : "text-red-700 bg-red-50 border-red-200 dark:text-red-400 dark:bg-red-950 dark:border-red-800"}`;

  return (
    <div className="space-y-6">
      {!isVerified && (
        <div className="border-l-4 border-amber-500 bg-amber-50 dark:bg-amber-950 px-4 py-3">
          <p className="font-sans text-sm text-amber-700 dark:text-amber-300 mb-2">Email not verified. Verify to write posts.</p>
          {!sent
            ? <button onClick={() => { setSent(true); emailOrchestrator(user.public_id, user.email); }}
                className="font-sans text-xs font-semibold border border-amber-400 text-amber-700 dark:text-amber-300 px-3 py-1 rounded-full hover:bg-amber-100 dark:hover:bg-amber-900 transition-colors cursor-pointer">
                Send verification email
              </button>
            : <p className="font-sans text-xs text-green-700 dark:text-green-400">Email sent — check your inbox and refresh this page.</p>
          }
        </div>
      )}
      {state.message && <p className={msgCls(state.success)}>{state.message}</p>}

      <div className="border-b border-[var(--border)] pb-6">
        <h2 className="font-sans text-xs font-bold uppercase tracking-widest text-[var(--text-faint)] mb-4">Profile</h2>
        <Form action={formAction} className="space-y-4">
          <input type="hidden" name="ppid" value={user.public_id} readOnly />
          <div><label className={LC}>Full Name</label><input name="name" defaultValue={user.name} className={IC} /></div>
          <div>
            <label className={LC}>Username</label>
            <input name="username" defaultValue={user.username} className={IC} onBlur={(e) => startTransition(() => usernameAction(e.target.value))} />
            {usernamePending && <p className="font-sans mt-1 text-xs text-[var(--text-faint)]">Checking…</p>}
            {usernameState?.message && <p className={`font-sans mt-1 text-xs ${usernameState.ok ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>{usernameState.message}</p>}
          </div>
          <div>
            <label className={LC}>Email</label>
            <input name="email" defaultValue={user.email} type="email" className={IC} onBlur={(e) => startTransition(() => emailAction(e.target.value))} />
            {emailPending && <p className="font-sans mt-1 text-xs text-[var(--text-faint)]">Checking…</p>}
            {emailState?.message && <p className={`font-sans mt-1 text-xs ${emailState.ok ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>{emailState.message}</p>}
          </div>
          <button type="submit" disabled={isPending}
            className="font-sans font-semibold bg-[var(--text)] text-[var(--bg)] px-6 py-2 rounded-full text-sm hover:opacity-80 disabled:opacity-50 transition-opacity cursor-pointer">
            {isPending ? "Saving…" : "Save Changes"}
          </button>
        </Form>
      </div>

      <div>
        <h2 className="font-sans text-xs font-bold uppercase tracking-widest text-[var(--text-faint)] mb-4">Account</h2>
        <div className="flex flex-col gap-3 items-start">
          <Form action={logout}>
            <button type="submit" className="font-sans text-sm text-[var(--text-muted)] border border-[var(--border)] px-4 py-2 rounded-full hover:border-[var(--text)] hover:text-[var(--text)] transition-colors cursor-pointer">
              Logout
            </button>
          </Form>
          <Link href="/delete_account" className="font-sans text-sm text-red-500 hover:underline underline-offset-4 transition-colors">Delete Account</Link>
        </div>
      </div>
    </div>
  );
}
