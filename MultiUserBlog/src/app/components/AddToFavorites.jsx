'use client';
import Form from "next/form";
import { addTofavorites } from "../lib/posts/favorites";
import { useActionState } from "react";

export default function AddTofavorites({ ppid, isFavorited = false }) {
  const initialState = { ok: null, message: "", added: false, removed: false };
  const [state, formAction, isPending] = useActionState(addTofavorites, initialState);
  const fav = state.added ? true : state.removed ? false : isFavorited;
  return (
    <Form action={formAction}>
      <input type="hidden" name="ppid" value={ppid} readOnly />
      <button
        type="submit"
        disabled={isPending}
        title={fav ? "Remove from favorites" : "Add to favorites"}
        aria-label={fav ? "Remove from favorites" : "Add to favorites"}
        className={`min-w-12 rounded-md border px-2 py-1 font-sans text-xs font-semibold transition-colors disabled:opacity-40 cursor-pointer ${fav ? "border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent)]" : "border-[var(--border)] text-[var(--text-faint)] hover:border-[var(--accent)] hover:text-[var(--accent)]"}`}
      >
        {fav ? "Saved" : "Save"}
      </button>
    </Form>
  );
}
