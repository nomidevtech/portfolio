'use client'
import { postUpsert } from "@/app/lib/posts/upsert";
import Form from "next/form";
import { useState, useEffect, useActionState } from "react";

const IC = "w-full font-sans bg-[var(--bg-subtle)] border border-[var(--border)] text-[var(--text)] placeholder-[var(--text-faint)] rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--text)] focus:border-transparent transition-colors";
const LC = "block font-sans text-xs text-[var(--text-faint)] uppercase tracking-widest mb-1.5";

export default function PostForm({ post = {}, taxonomies = [], tags = [] }) {
  const prevContent = [];
  post.content?.forEach(item => { if (item.type && item.value) prevContent.push([item.type, item.value]); });
  const initialState = { ok: null, message: "" };
  const [state, formAction, isPending] = useActionState(postUpsert, initialState);
  const [blocks, setBlocks] = useState([]);
  const [userTags, setUserTags] = useState(post.tags || []);
  useEffect(() => { setBlocks(prevContent); }, []);

  const addBlock = (type) => setBlocks(prev => [...prev, [type, null]]);
  const removeBlock = (i) => setBlocks(prev => prev.filter((_, j) => j !== i));
  const insertAfter = (i, type) => setBlocks(prev => { const c = [...prev]; c.splice(i+1,0,[type,null]); return c; });
  const msgCls = (ok) => `font-sans mb-4 text-sm px-4 py-2.5 rounded-lg border ${ok ? "text-green-700 bg-green-50 border-green-200 dark:text-green-400 dark:bg-green-950 dark:border-green-800" : "text-red-700 bg-red-50 border-red-200 dark:text-red-400 dark:bg-red-950 dark:border-red-800"}`;

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-2xl font-bold text-[var(--text)] mb-6">{post.post_public_id ? "Edit Post" : "New Post"}</h1>
      {state.message && <div className={msgCls(state.ok)}>{state.message}</div>}
      <Form action={formAction} className="space-y-5">
        <input name="post_public_id" type="hidden" readOnly value={post.post_public_id} />
        <div><label className={LC}>Title</label><input name="title" type="text" placeholder="Post title" defaultValue={post.title ?? ""} className={IC} /></div>
        <div><label className={LC}>Excerpt</label><textarea name="excerpt" placeholder="Short summary..." rows={3} defaultValue={post.excerpt ?? ""} className={`${IC} resize-none`} /></div>
        <div>
          <label className={LC}>Category</label>
          <input name="taxonomy" type="text" list="taxonomy-list" placeholder="Select or type a category" defaultValue={post.taxonomy ?? ""} className={IC} />
          <datalist id="taxonomy-list">{taxonomies.map((t, i) => <option key={i} value={t} />)}</datalist>
        </div>
        <div>
          <label className={LC}>Tags</label>
          <input type="text" list="tags-list" placeholder="Type and press Enter" className={IC}
            onKeyDown={(e) => { if (e.key !== "Enter") return; e.preventDefault(); const v = e.target.value.trim(); if (!v || userTags.includes(v)) return; setUserTags(p => [...p, v]); e.target.value = ""; }}
            onChange={(e) => { const v = e.target.value.trim(); if (!v || !tags.includes(v) || userTags.includes(v)) return; setUserTags(p => [...p, v]); e.target.value = ""; }}
          />
          <datalist id="tags-list">{tags.map((t, i) => <option key={i} value={t} />)}</datalist>
          {userTags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {userTags.map((tg, i) => (
                <div key={i} className="flex items-center gap-1.5 bg-[var(--bg-subtle)] border border-[var(--border)] rounded-full px-3 py-1">
                  <input name="tags" type="hidden" value={tg} />
                  <span className="font-sans text-xs text-[var(--text-muted)]">#{tg}</span>
                  <button type="button" onClick={() => setUserTags(p => p.filter((_,j)=>j!==i))} className="font-sans text-[var(--text-faint)] hover:text-[var(--text)] text-xs cursor-pointer">x</button>
                </div>
              ))}
            </div>
          )}
        </div>
        <div>
          <label className={LC}>Content</label>
          <div className="space-y-3">
            {blocks.map(([key, value], index) => (
              <div key={index} className="border border-[var(--border)] rounded-xl p-4 bg-[var(--bg-subtle)]">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-sans text-xs uppercase tracking-widest text-[var(--text-faint)] font-semibold">{key}</span>
                  <button type="button" onClick={() => removeBlock(index)} className="font-sans text-xs text-red-500 hover:underline cursor-pointer">Remove</button>
                </div>
                {key === "heading" && <input name={`heading-${index}`} type="text" placeholder="Heading" defaultValue={value} className={IC} />}
                {key === "paragraph" && <textarea name={`paragraph-${index}`} rows={5} placeholder="Paragraph..." defaultValue={value} className={`${IC} resize-none`} />}
                {key === "image" && (value?.url
                  ? <><img src={value.url} alt="block" className="w-full max-h-64 object-cover rounded-lg mb-2" /><input name={`image-${index}`} type="hidden" value={JSON.stringify(value)} /></>
                  : <input name={`image-${index}`} type="file" className="font-sans text-sm text-[var(--text-muted)] file:mr-3 file:py-1.5 file:px-4 file:rounded-full file:border file:border-[var(--border)] file:text-xs file:font-semibold file:bg-[var(--bg)] file:text-[var(--text-muted)] cursor-pointer" />
                )}
                <div className="flex gap-2 mt-3 pt-3 border-t border-[var(--border)]">
                  <span className="font-sans text-xs text-[var(--text-faint)] self-center">After:</span>
                  {["heading","paragraph","image"].map(tp => (
                    <button key={tp} type="button" onClick={() => insertAfter(index, tp)}
                      className="font-sans text-xs text-[var(--text-faint)] border border-[var(--border)] hover:border-[var(--text)] hover:text-[var(--text)] rounded-full px-2.5 py-1 transition-colors cursor-pointer capitalize">{tp}</button>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="flex gap-2 mt-3">
            {["heading","paragraph","image"].map(tp => (
              <button key={tp} type="button" onClick={() => addBlock(tp)}
                className="font-sans text-xs border border-[var(--border)] text-[var(--text-muted)] hover:border-[var(--text)] hover:text-[var(--text)] bg-[var(--bg-subtle)] px-3 py-2 rounded-full transition-colors cursor-pointer capitalize">+ {tp}</button>
            ))}
          </div>
        </div>
        <button type="submit" disabled={isPending}
          className="font-sans font-semibold bg-[var(--text)] text-[var(--bg)] px-6 py-2.5 rounded-full text-sm hover:opacity-80 disabled:opacity-50 transition-opacity cursor-pointer">
          {post.post_public_id ? (isPending ? "Updating..." : "Update Post") : (isPending ? "Publishing..." : "Publish Post")}
        </button>
      </Form>
    </div>
  );
}
