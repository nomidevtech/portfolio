"use client";

import { useState, useActionState } from "react";
import { deletePostServerAction } from "../lib/posts/deletePost";

export default function DeleteButton({ publicId }) {

  const initialState = { ok: null, message: "" };

  const [showConfirm, setShowConfirm] = useState(false);
  const [state, formAction, pending] = useActionState(deletePostServerAction, initialState);

  if (!showConfirm) {
    return <button onClick={() => setShowConfirm(true)}>Delete</button>;
  }

  return (
    <div>
      <p>Are you sure?</p>

      {state?.ok === false && (
        <p style={{ color: "red" }}>{state.message}</p>
      )}

      <button type="button" onClick={() => setShowConfirm(false)}>
        Cancel
      </button>

      <form action={formAction}>
        <input type="hidden" name="ppid" value={publicId} />
        <button type="submit" disabled={pending}>
          {pending ? "Deleting..." : "Confirm"}
        </button>
      </form>
    </div>
  );
}