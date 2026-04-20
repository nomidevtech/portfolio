"use client";
import { useState, useActionState } from "react";
import { deletePostServerAction } from "../lib/posts/deletePost";

export default function DeleteButton({ publicId }) {
  const initialState = { ok: null, message: "" };
  const [showConfirm, setShowConfirm] = useState(false);
  const [state, formAction, pending] = useActionState(deletePostServerAction, initialState);
  if (!showConfirm) return (
    <button onClick={() => setShowConfirm(true)}
      className="font-sans text-xs border border-[var(--border)] text-red-500 px-3 py-1 rounded-full hover:border-red-400 transition-colors cursor-pointer">
      Delete
    </button>
  );
  return (
    <div className="flex items-center gap-2">
      <span className="font-sans text-xs text-[var(--text-muted)]">Sure?</span>
      {state?.ok === false && <span className="font-sans text-xs text-red-500">{state.message}</span>}
      <button type="button" onClick={() => setShowConfirm(false)}
        className="font-sans text-xs border border-[var(--border)] text-[var(--text-muted)] px-3 py-1 rounded-full hover:border-[var(--text)] transition-colors cursor-pointer">
        Cancel
      </button>
      <form action={formAction} className="inline">
        <input type="hidden" name="ppid" value={publicId} />
        <button type="submit" disabled={pending}
          className="font-sans text-xs bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white px-3 py-1 rounded-full transition-colors cursor-pointer">
          {pending ? "Deleting…" : "Confirm"}
        </button>
      </form>
    </div>
  );
}
