import AddTofavorites from "@/app/components/AddToFavorites";
import DeleteButton from "@/app/components/DeleteBTN";
import { getUser } from "@/app/lib/getUser";
import { db } from "@/app/lib/turso";
import Image from "next/image";
import Link from "next/link";
import Comments from "./Comments";

function formatDate(d) {
  if (!d) return "";
  return new Date(d).toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric" });
}

export default async function DynamicPost({ params }) {
  const { slug, pid } = await params;
  if (!slug || !pid) return <div className="max-w-3xl mx-auto px-4 py-16"><p className="font-sans text-[var(--text-muted)]">Broken link.</p></div>;

  const currentUser = await getUser();
  const fetchPost = await db.execute(`
    SELECT posts.*, taxonomies.name as taxonomy, GROUP_CONCAT(DISTINCT tags.name) as tags,
    users.username as author, users.public_id as author_public_id, users.id as user_id
    FROM posts LEFT JOIN post_taxonomies ON posts.id = post_taxonomies.post_id
    LEFT JOIN taxonomies ON post_taxonomies.taxonomy_id = taxonomies.id
    LEFT JOIN post_tags ON posts.id = post_tags.post_id
    LEFT JOIN tags ON post_tags.tag_id = tags.id
    LEFT JOIN users ON posts.user_id = users.id
    WHERE posts.public_id = ? GROUP BY posts.id
  `, [pid]);
  if (!fetchPost?.rows?.length) return <div className="max-w-3xl mx-auto px-4 py-16"><p className="font-sans text-[var(--text-muted)]">Post not found.</p></div>;

  const post = fetchPost.rows[0];
  const tags = post?.tags?.split(",").map(t => t.trim()).filter(Boolean) || [];
  const content = JSON.parse(post.content);
  let isFavorited = false;
  if (currentUser?.id) {
    const r = await db.execute("SELECT * FROM favorites WHERE user_id = ? AND post_id = ?", [currentUser.id, post.id]);
    isFavorited = r?.rows?.length > 0;
  }
  const fetchComments = await db.execute("SELECT * FROM comments WHERE post_id = ? ORDER BY created_at DESC", [post.id]);
  const comments = (fetchComments?.rows || []).map(c => ({
    cPId: c.public_id, comment: c.comment, username: c.username,
    created_at: c.created_at, updated_at: c.updated_at, isOwned: c.user_id === currentUser?.id
  }));

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      {post?.slug !== slug && (
        <div className="mb-4 border-l-4 border-amber-500 bg-amber-50 dark:bg-amber-950 px-4 py-3">
          <p className="font-sans text-sm text-amber-700 dark:text-amber-400">URL conflict — the slug has changed. Please use the updated link.</p>
        </div>
      )}

      {/* Article header */}
      <header className="mb-8 pb-6 border-b border-[var(--border)]">
        {post.taxonomy && (
          <Link href={`/taxonomies?value=${post.taxonomy}`}
            className="font-sans text-xs font-bold uppercase tracking-widest text-[var(--accent)] hover:underline">
            {post.taxonomy}
          </Link>
        )}
        <h1 className="text-3xl sm:text-4xl font-bold text-[var(--text)] leading-tight mt-2 mb-4">
          {post.title}
        </h1>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 font-sans text-sm text-[var(--text-muted)]">
          {post.author && (
            <Link href={`/authors?value=${post.author}`} className="hover:text-[var(--text)] transition-colors">
              {post.author}
            </Link>
          )}
          {post.created_at && <span className="text-[var(--text-faint)]">{formatDate(post.created_at)}</span>}
          {post.updated_at !== post.created_at && (
            <span className="text-[var(--text-faint)] text-xs">Updated {formatDate(post.updated_at)}</span>
          )}
          {currentUser?.id
            ? <AddTofavorites ppid={post.public_id} isFavorited={isFavorited} />
            : <Link href="/login" className="text-[var(--text-faint)] text-xs hover:text-[var(--text)] transition-colors">Login to save</Link>
          }
        </div>
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-3 mt-3">
            {tags.map((t, i) => (
              <Link key={i} href={`/tags?value=${t}`} className="font-sans text-xs text-[var(--text-faint)] hover:text-[var(--text)] transition-colors">#{t}</Link>
            ))}
          </div>
        )}
        {currentUser?.id === post.user_id && (
          <div className="flex gap-3 mt-4">
            <Link href={`/edit?value=${post.public_id}`}
              className="font-sans text-xs border border-[var(--border)] text-[var(--text-muted)] px-3 py-1 rounded-full hover:border-[var(--text)] hover:text-[var(--text)] transition-colors">
              Edit
            </Link>
            <DeleteButton publicId={post.public_id} />
          </div>
        )}
      </header>

      {/* Article body */}
      {post.content && (
        <div className="mb-12 space-y-5">
          {content.map((item, i) => {
            if (item.type === "heading") return (
              <h2 key={i} className="text-2xl font-bold text-[var(--text)] mt-8 mb-3 leading-snug">{item.value}</h2>
            );
            if (item.type === "paragraph") return (
              <p key={i} className="font-sans text-base text-[var(--text-muted)] leading-relaxed">{item.value}</p>
            );
            if (item.type === "image" && item.value?.url) return (
              <figure key={i} className="my-6">
                <Image src={item.value.url} alt={`${post.slug}-${i}`} width={800} height={500} className="w-full object-cover" />
              </figure>
            );
          })}
        </div>
      )}

      {/* Comments */}
      <div className="border-t border-[var(--border)] pt-8">
        <Comments
          commentsSerialized={JSON.stringify(comments)}
          isLoggedIn={!!currentUser?.id}
          postPublicId={post.public_id}
          userPublicId={currentUser?.public_id}
          isVerified={currentUser?.email_verified === 1}
        />
      </div>
    </div>
  );
}
