'use client';
import { useActionState, useEffect, useState } from "react";
import { commentsSA } from "./commentsSA";
import Form from "next/form";

function formatDate(d) {
  if (!d) return "";
  return new Date(d).toLocaleDateString("en-US", { day: "numeric", month: "short" });
}

export default function Comments({ commentsSerialized, isLoggedIn, postPublicId, userPublicId, isVerified }) {
  const comments = JSON.parse(commentsSerialized);
  const initialState = { ok: false, message: "", comment: null, deleted: false, cPId: null };
  const [state, action, isPending] = useActionState(commentsSA, initialState);
  const [commentsState, setCommentsState] = useState(comments);
  const [isEditing, setIsEditing] = useState("");

  useEffect(() => {
    if (!state.ok) return;
    setCommentsState(prev => {
      if (state.deleted) return prev.filter(c => c.cPId !== state.cPId);
      const idx = prev.findIndex(c => c.cPId === state.cPId);
      if (idx !== -1) { const next = [...prev]; next[idx] = { ...next[idx], comment: state.comment, username: state.username, isOwned: true }; return next; }
      return [{ cPId: state.cPId, comment: state.comment, username: state.username, isOwned: true }, ...prev];
    });
    setIsEditing("");
  }, [state]);

  const inputCls = "w-full font-sans bg-[var(--bg-subtle)] border border-[var(--border)] text-[var(--text)] placeholder-[var(--text-faint)] rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--text)] resize-none transition-colors";

  return (
    <div>
      <h3 className="text-xl font-bold text-[var(--text)] mb-5">
        Comments {commentsState.length > 0 && <span className="text-[var(--text-faint)] font-normal text-base">({commentsState.length})</span>}
      </h3>

      {isLoggedIn && isVerified ? (
        <Form action={action} className="mb-8">
          <input type="hidden" name="post_public_id" value={postPublicId} />
          <input type="hidden" name="user_public_id" value={userPublicId} />
          <textarea name="comment" placeholder="Write a comment…" rows={3} className={`${inputCls} mb-3`} />
          <button type="submit" disabled={isPending}
            className="font-sans text-sm font-semibold bg-[var(--text)] text-[var(--bg)] px-5 py-2 rounded-full hover:opacity-80 disabled:opacity-50 transition-opacity cursor-pointer">
            {isPending ? "Posting…" : "Post comment"}
          </button>
        </Form>
      ) : (
        <div className="mb-8 border border-[var(--border)] rounded-lg px-4 py-3 font-sans text-sm text-[var(--text-faint)]">
          {isLoggedIn ? "Verify your email to comment." : "Login and verify your email to comment."}
        </div>
      )}

      {commentsState.length === 0
        ? <p className="font-sans text-sm text-[var(--text-faint)]">No comments yet. Be the first!</p>
        : <div className="space-y-5">
            {commentsState.map(comment => (
              <div key={comment.cPId} className="border-b border-[var(--border)] pb-5">
                {isEditing !== comment.cPId ? (
                  <>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-sans text-sm font-semibold text-[var(--text)]">@{comment.username}</span>
                      {comment.created_at && <span className="font-sans text-xs text-[var(--text-faint)]">{formatDate(comment.created_at)}</span>}
                    </div>
                    <p className="font-sans text-sm text-[var(--text-muted)] leading-relaxed">{comment.comment}</p>
                    {comment.isOwned && (
                      <div className="flex gap-3 mt-2.5">
                        <button onClick={() => setIsEditing(comment.cPId)}
                          className="font-sans text-xs border border-[var(--border)] text-[var(--text-muted)] px-3 py-1 rounded-full hover:border-[var(--text)] hover:text-[var(--text)] transition-colors cursor-pointer">
                          Edit
                        </button>
                        <Form action={action} className="inline">
                          <input type="hidden" name="comment_public_id" value={comment.cPId} />
                          <input type="hidden" name="post_public_id" value={postPublicId} />
                          <input type="hidden" name="user_public_id" value={userPublicId} />
                          <button type="submit" name="delete" value="true"
                            className="font-sans text-xs border border-[var(--border)] text-red-500 px-3 py-1 rounded-full hover:border-red-400 transition-colors cursor-pointer">
                            Delete
                          </button>
                        </Form>
                      </div>
                    )}
                  </>
                ) : (
                  <Form action={action} className="space-y-3">
                    <input type="hidden" name="comment_public_id" value={comment.cPId} />
                    <input type="hidden" name="post_public_id" value={postPublicId} />
                    <input type="hidden" name="user_public_id" value={userPublicId} />
                    <textarea name="comment" defaultValue={comment.comment} rows={3} className={inputCls} />
                    <div className="flex gap-2">
                      <button type="submit"
                        className="font-sans text-xs font-semibold bg-[var(--text)] text-[var(--bg)] px-4 py-1.5 rounded-full hover:opacity-80 transition-opacity cursor-pointer">
                        Update
                      </button>
                      <button type="button" onClick={() => setIsEditing("")}
                        className="font-sans text-xs border border-[var(--border)] text-[var(--text-muted)] px-4 py-1.5 rounded-full hover:border-[var(--text)] transition-colors cursor-pointer">
                        Cancel
                      </button>
                      <Form action={action} className="inline">
                        <input type="hidden" name="comment_public_id" value={comment.cPId} />
                        <input type="hidden" name="post_public_id" value={postPublicId} />
                        <input type="hidden" name="user_public_id" value={userPublicId} />
                        <button type="submit" name="delete" value="true"
                          className="font-sans text-xs border border-[var(--border)] text-red-500 px-3 py-1.5 rounded-full hover:border-red-400 transition-colors cursor-pointer">
                          Delete
                        </button>
                      </Form>
                    </div>
                  </Form>
                )}
              </div>
            ))}
          </div>
      }
    </div>
  );
}
