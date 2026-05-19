'use client'
import { startTransition, useActionState } from "react"
import Form from "next/form"
import Link from "next/link"
import { signuptServerAction } from "./signupSA"
import { checkUsername } from "@/app/lib/checkUsername"
import { checkEmail } from "@/app/lib/checkEmail"

export default function SignUpClientComponent() {
  const initialState = { ok: null, message: "" };
  const [submitState, submitAction, submitPending] = useActionState(signuptServerAction, initialState);
  const [usernameState, usernameAction, usernamePending] = useActionState(checkUsername, null);
  const [emailState, emailAction, emailPending] = useActionState(checkEmail, null);
  const inputClass = "w-full font-sans bg-[var(--bg-raised)] border border-[var(--border)] text-[var(--text)] placeholder-[var(--text-faint)] rounded-md px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent transition-colors";

  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-[var(--bg)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <p className="font-sans text-xs uppercase tracking-widest text-[var(--accent)] mb-3">Inkline</p>
        <h1 className="text-2xl font-bold text-[var(--text)] mb-1">Create account</h1>
        <p className="font-sans text-sm text-[var(--text-faint)] mb-7">Join the community and start publishing.</p>
        {submitState?.message && (
          <div className={`font-sans mb-5 text-sm px-4 py-2.5 rounded-md border ${submitState.ok ? "text-green-700 bg-green-50 border-green-200 dark:text-green-400 dark:bg-green-950 dark:border-green-800" : "text-red-700 bg-red-50 border-red-200 dark:text-red-400 dark:bg-red-950 dark:border-red-800"}`}>
            {submitState.message}
          </div>
        )}
        <Form action={submitAction} className="space-y-4">
          <div>
            <label className="block font-sans text-xs text-[var(--text-faint)] uppercase tracking-widest mb-1.5">Full name</label>
            <input name="name" type="text" placeholder="John Doe" className={inputClass} />
          </div>
          <div>
            <label className="block font-sans text-xs text-[var(--text-faint)] uppercase tracking-widest mb-1.5">Username</label>
            <input name="username" type="text" placeholder="john_doe" className={inputClass} onBlur={(e) => startTransition(() => usernameAction(e.target.value))} />
            {usernamePending && <p className="font-sans mt-1 text-xs text-[var(--text-faint)]">Checking...</p>}
            {usernameState?.message && <p className={`font-sans mt-1 text-xs ${usernameState.ok ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>{usernameState.message}</p>}
          </div>
          <div>
            <label className="block font-sans text-xs text-[var(--text-faint)] uppercase tracking-widest mb-1.5">Email</label>
            <input name="email" type="email" placeholder="john@example.com" className={inputClass} onBlur={(e) => startTransition(() => emailAction(e.target.value))} />
            {emailPending && <p className="font-sans mt-1 text-xs text-[var(--text-faint)]">Checking...</p>}
            {emailState?.message && <p className={`font-sans mt-1 text-xs ${emailState.ok ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>{emailState.message}</p>}
          </div>
          <div>
            <label className="block font-sans text-xs text-[var(--text-faint)] uppercase tracking-widest mb-1.5">Password</label>
            <input name="password" type="password" placeholder="Create a password" className={inputClass} />
          </div>
          <div>
            <label className="block font-sans text-xs text-[var(--text-faint)] uppercase tracking-widest mb-1.5">Confirm password</label>
            <input name="confirmPassword" type="password" placeholder="Repeat your password" className={inputClass} />
          </div>
          <button type="submit" disabled={submitPending} className="font-sans font-semibold bg-[var(--text)] text-[var(--bg)] px-6 py-2.5 rounded-md text-sm hover:opacity-85 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity cursor-pointer w-full mt-2">
            {submitPending ? "Creating account..." : "Create account"}
          </button>
        </Form>
        <p className="font-sans text-sm text-[var(--text-faint)] text-center mt-6">
          Already have an account? <Link href="/login" className="text-[var(--text)] underline underline-offset-4 hover:text-[var(--accent)] transition-colors">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
