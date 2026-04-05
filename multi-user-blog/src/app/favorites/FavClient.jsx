'use client'
import Link from "next/link";
import DeleteButton from "../components/DeleteBTN";
import { useState } from "react";
import AddTofavorites from "../components/AddToFavorites";

function fmt(d) {
  if (!d) return "";
  return new Date(d).toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric" });
}

export default function FavoritesClientComponent({ postsSerialized }) {
  const [showAll, setShowAll] = useState(true);
  const posts = JSON.parse(postsSerialized);
  const filtered = showAll ? posts : posts.filter(p => p.isOwned);

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-center justify-between mb-8 pb-4 border-b-2 border-[var(--text)]">
        <h1 className="text-2xl font-bold text-[var(--text)]">Favorites</h1>
        <div className="flex items-center gap-1 border border-[var(--border)] rounded-full p-1">
          {[["All", true], ["Mine", false]].map(([label, val]) => (
            <button key={label} onClick={() => setShowAll(val)}
              className={`font-sans text-xs px-3 py-1 rounded-full transition-colors cursor-pointer ${showAll === val ? "bg-[var(--text)] text-[var(--bg)] font-semibold" : "text-[var(--text-muted)] hover:text-[var(--text)]"}`}>
              {label}
            </button>
          ))}
        </div>
      </div>
      {filtered.length === 0
        ? <p className="font-sans text-[var(--text-faint)]">No posts found.</p>
        : filtered.map(post => {
            const tags = post.tags ? post.tags.split(",").map(t => t.trim()).filter(Boolean) : [];
            return (
              <article key={post.id} className="py-5 border-b border-[var(--border)]">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    {post.taxonomy && <span className="font-sans text-xs font-bold uppercase tracking-widest text-[var(--accent)] mr-2">{post.taxonomy}</span>}
                    <h3 className="text-lg font-bold text-[var(--text)] leading-snug mt-1 mb-1.5">
                      <Link href={`/post/${post.slug}/${post.public_id}`} className="hover:text-[var(--accent)] transition-colors">{post.title}</Link>
                    </h3>
                    {post.excerpt && <p className="font-sans text-sm text-[var(--text-muted)] leading-relaxed mb-2 line-clamp-2 hidden sm:block">{post.excerpt}</p>}
                    <div className="flex flex-wrap gap-x-3 gap-y-1 font-sans text-xs text-[var(--text-faint)]">
                      {post.author && <span>{post.author}</span>}
                      <span>{fmt(post.created_at)}</span>
                      {tags.map((t, i) => <Link key={i} href={`/tags?value=${t}`} className="hover:text-[var(--text)] transition-colors">#{t}</Link>)}
                    </div>
                  </div>
                  {post.isFavorited && <div className="shrink-0 mt-1"><AddTofavorites ppid={post.public_id} isFavorited={post.isFavorited} /></div>}
                </div>
                {post.isOwned && (
                  <div className="flex gap-3 mt-2.5">
                    <Link href={`/edit?value=${post.public_id}`} className="font-sans text-xs border border-[var(--border)] text-[var(--text-muted)] px-3 py-1 rounded-full hover:border-[var(--text)] hover:text-[var(--text)] transition-colors">Edit</Link>
                    <DeleteButton publicId={post.public_id} />
                  </div>
                )}
              </article>
            );
          })
      }
    </div>
  );
}
