import Link from "next/link";
import { getUser } from "../lib/getUser";
import { db } from "../lib/turso";
import AddTofavorites from "../components/AddToFavorites";
import DeleteButton from "../components/DeleteBTN";

function formatDate(d) {
  if (!d) return "";
  return new Date(d).toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric" });
}

function PostRow({ post, currentUser }) {
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
            <p className="font-sans text-sm text-[var(--text-muted)] leading-relaxed mb-2 line-clamp-2 hidden sm:block">
              {post.excerpt}
            </p>
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
          <Link href={`/edit?value=${post.public_id}`} className="font-sans text-xs border border-[var(--border)] text-[var(--text-muted)] px-3 py-1 rounded-full hover:border-[var(--text)] hover:text-[var(--text)] transition-colors">Edit</Link>
          <DeleteButton publicId={post.public_id} />
        </div>
      )}
    </article>
  );
}

export default async function Tags({ searchParams }) {
  const { value } = await searchParams;
  if (!value) return <div className="max-w-3xl mx-auto px-4 py-16"><p className="font-sans text-[var(--text-muted)]">No tag specified.</p></div>;
  const tag = value;
  const fetchPosts = await db.execute(`
    SELECT posts.*, taxonomies.name as taxonomy, GROUP_CONCAT(DISTINCT tags.name) as tags, users.username as author
    FROM posts LEFT JOIN post_taxonomies ON posts.id = post_taxonomies.post_id
    LEFT JOIN taxonomies ON post_taxonomies.taxonomy_id = taxonomies.id
    LEFT JOIN post_tags ON posts.id = post_tags.post_id
    LEFT JOIN tags ON post_tags.tag_id = tags.id
    LEFT JOIN users ON posts.user_id = users.id
    WHERE tags.name = ? GROUP BY posts.id ORDER BY posts.created_at DESC
  `, [tag]);
  if (!fetchPosts?.rows?.length) return <div className="max-w-3xl mx-auto px-4 py-16"><p className="font-sans text-[var(--text-muted)]">No posts tagged #{tag}.</p></div>;
  const posts = fetchPosts.rows;
  const currentUser = await getUser();
  let favIds = [];
  if (currentUser?.id) { const r = await db.execute("SELECT post_id FROM favorites WHERE user_id = ?", [currentUser.id]); favIds = r.rows.map(row => row.post_id); }
  for (const p of posts) p.isFavorited = favIds.includes(p.id);
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-8 pb-4 border-b-2 border-[var(--text)]">
        <p className="font-sans text-xs uppercase tracking-widest text-[var(--accent)] mb-1">Tag</p>
        <h1 className="text-2xl font-bold text-[var(--text)]">#{tag}</h1>
        <p className="font-sans text-sm text-[var(--text-faint)] mt-1">{posts.length} article{posts.length !== 1 ? "s" : ""}</p>
      </div>
      {posts.map((post, i) => <PostRow key={i} post={post} currentUser={currentUser} />)}
    </div>
  );
}
