import Link from "next/link";
import DeleteButton from "./DeleteBTN";
import AddTofavorites from "./AddToFavorites";

function formatDate(d) {
  if (!d) return "";
  return new Date(d).toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric" });
}

export default function PostCard({ post, currentUser }) {
  const tags = post.tags ? post.tags.split(",").map(t => t.trim()).filter(Boolean) : [];
  return (
    <article className="py-5 border-b border-[var(--border)]">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          {post.taxonomy && (
            <Link href={`/taxonomies?value=${post.taxonomy}`}
              className="font-sans text-xs font-bold uppercase tracking-widest text-[var(--accent)] hover:underline mr-2">
              {post.taxonomy}
            </Link>
          )}
          <h3 className="text-lg font-bold text-[var(--text)] leading-snug mt-1 mb-1.5">
            <Link href={`/post/${post.slug}/${post.public_id}`} className="hover:text-[var(--accent)] transition-colors">
              {post.title}
            </Link>
          </h3>
          {post.excerpt && (
            <p className="font-sans text-sm text-[var(--text-muted)] leading-relaxed mb-2 line-clamp-2 hidden sm:block">{post.excerpt}</p>
          )}
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 font-sans text-xs text-[var(--text-faint)]">
            {post.author && <Link href={`/authors?value=${post.author}`} className="hover:text-[var(--text)] transition-colors">{post.author}</Link>}
            <span>{formatDate(post.created_at)}</span>
            {tags.map((t, i) => <Link key={i} href={`/tags?value=${t}`} className="hover:text-[var(--text)] transition-colors">#{t}</Link>)}
          </div>
        </div>
        {currentUser?.id && <div className="shrink-0 mt-1"><AddTofavorites ppid={post.public_id} isFavorited={post.isFavorited ?? false} /></div>}
      </div>
      {post.user_id === currentUser?.id && (
        <div className="flex gap-3 mt-2.5">
          <Link href={`/edit?value=${post.public_id}`}
            className="font-sans text-xs border border-[var(--border)] text-[var(--text-muted)] px-3 py-1 rounded-full hover:border-[var(--text)] hover:text-[var(--text)] transition-colors">
            Edit
          </Link>
          <DeleteButton publicId={post.public_id} />
        </div>
      )}
    </article>
  );
}
