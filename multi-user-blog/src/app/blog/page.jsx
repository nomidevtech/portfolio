import Link from "next/link";
import { getUser } from "../lib/getUser";
import { db } from "../lib/turso";
import { paginate } from "../utils/pagination";
import SearchBar from "./SearchBar";
import AddTofavorites from "../components/AddToFavorites";
import DeleteButton from "../components/DeleteBTN";

function formatDate(d) {
  if (!d) return "";
  return new Date(d).toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric" });
}

/* ── Hero post (first, large) ── */
function HeroPost({ post, currentUser }) {
  const tags = post.tags ? post.tags.split(",").map(t => t.trim()).filter(Boolean) : [];
  return (
    <article className="pb-8 mb-8 border-b-2 border-[var(--text)]">
      <div className="flex flex-wrap gap-2 mb-3">
        {post.taxonomy && (
          <Link href={`/taxonomies?value=${post.taxonomy}`}
            className="font-sans text-xs font-bold uppercase tracking-widest text-[var(--accent)] hover:underline">
            {post.taxonomy}
          </Link>
        )}
      </div>
      <h2 className="text-3xl sm:text-4xl font-bold text-[var(--text)] leading-tight mb-3">
        <Link href={`/post/${post.slug}/${post.public_id}`} className="hover:text-[var(--accent)] transition-colors">
          {post.title}
        </Link>
      </h2>
      {post.excerpt && (
        <p className="font-sans text-base text-[var(--text-muted)] leading-relaxed mb-4 max-w-2xl">
          {post.excerpt}
        </p>
      )}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 font-sans text-sm text-[var(--text-faint)]">
        {post.author && (
          <Link href={`/authors?value=${post.author}`} className="hover:text-[var(--text)] transition-colors">
            {post.author}
          </Link>
        )}
        <span>{formatDate(post.created_at)}</span>
        {tags.map((t, i) => (
          <Link key={i} href={`/tags?value=${t}`} className="hover:text-[var(--text)] transition-colors">#{t}</Link>
        ))}
        {currentUser?.id && <AddTofavorites ppid={post.public_id} isFavorited={post.isFavorited ?? false} />}
      </div>
      {post.user_id === currentUser?.id && (
        <div className="flex gap-3 mt-3">
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

/* ── Standard list row ── */
function ListPost({ post, currentUser }) {
  const tags = post.tags ? post.tags.split(",").map(t => t.trim()).filter(Boolean) : [];
  return (
    <article className="py-5 border-b border-[var(--border)]">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          {post.taxonomy && (
            <Link href={`/taxonomies?value=${post.taxonomy}`}
              className="font-sans text-xs font-bold uppercase tracking-widest text-[var(--accent)] hover:underline mr-3">
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
            {post.author && (
              <Link href={`/authors?value=${post.author}`} className="hover:text-[var(--text)] transition-colors">
                {post.author}
              </Link>
            )}
            <span>{formatDate(post.created_at)}</span>
            {tags.map((t, i) => (
              <Link key={i} href={`/tags?value=${t}`} className="hover:text-[var(--text)] transition-colors">#{t}</Link>
            ))}
          </div>
        </div>
        {currentUser?.id && (
          <div className="shrink-0 mt-1">
            <AddTofavorites ppid={post.public_id} isFavorited={post.isFavorited ?? false} />
          </div>
        )}
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

export default async function Blog({ searchParams }) {
  let { page } = await searchParams;
  if (!page || page < 1) page = 1;
  const fetchTotal = await db.execute("SELECT COUNT(*) as total FROM posts");
  if (!fetchTotal?.rows?.length) return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16 text-center">
      <p className="font-sans text-[var(--text-muted)]">No posts yet.</p>
    </div>
  );
  const totalPosts = fetchTotal.rows[0].total;
  const offset = (page - 1) * 10;
  const fetchPosts = await db.execute(`
    SELECT posts.*, taxonomies.name as taxonomy,
    GROUP_CONCAT(DISTINCT tags.name) as tags,
    users.username as author
    FROM posts
    LEFT JOIN post_taxonomies ON posts.id = post_taxonomies.post_id
    LEFT JOIN taxonomies ON post_taxonomies.taxonomy_id = taxonomies.id
    LEFT JOIN post_tags ON posts.id = post_tags.post_id
    LEFT JOIN tags ON post_tags.tag_id = tags.id
    LEFT JOIN users ON posts.user_id = users.id
    GROUP BY posts.id ORDER BY posts.created_at DESC LIMIT ? OFFSET ?
  `, [10, offset]);

  const allPosts = fetchPosts.rows;
  const currentUser = await getUser();
  let favIds = [];
  if (currentUser?.id) {
    const r = await db.execute("SELECT post_id FROM favorites WHERE user_id = ?", [currentUser.id]);
    favIds = r.rows.map(row => row.post_id);
  }
  for (const p of allPosts) p.isFavorited = favIds.includes(p.id);

  const paginatedBtnsArr = paginate(page, totalPosts);
  const [hero, ...rest] = allPosts;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="flex items-start justify-between mb-8 pb-4 border-b-2 border-[var(--text)]">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text)]">Latest</h1>
          <p className="font-sans text-sm text-[var(--text-faint)] mt-0.5">{totalPosts} articles</p>
        </div>
        <SearchBar />
      </div>

      {/* Hero post */}
      {hero && <HeroPost post={hero} currentUser={currentUser} />}

      {/* Rest of posts */}
      <div>
        {rest.map((post, idx) => (
          <ListPost key={idx} post={post} currentUser={currentUser} />
        ))}
      </div>

      {/* Pagination */}
      {(Number(page) > 1 || Number(page) < Math.ceil(totalPosts / 10)) && (
        <div className="flex items-center justify-center gap-2 mt-10 font-sans">
          {Number(page) > 1 && (
            <Link href={`/blog?page=${Number(page) - 1}`}
              className="text-sm border border-[var(--border)] text-[var(--text-muted)] px-4 py-2 rounded-full hover:border-[var(--text)] hover:text-[var(--text)] transition-colors">
              ← Previous
            </Link>
          )}
          {paginatedBtnsArr.map((btn, i) => (
            <Link key={i} href={`/blog?page=${btn}`}
              className={`text-sm px-4 py-2 rounded-full transition-colors ${Number(page) === btn ? "bg-[var(--text)] text-[var(--bg)] font-semibold" : "border border-[var(--border)] text-[var(--text-muted)] hover:border-[var(--text)] hover:text-[var(--text)]"}`}>
              {btn}
            </Link>
          ))}
          {Number(page) < Math.ceil(totalPosts / 10) && (
            <Link href={`/blog?page=${Number(page) + 1}`}
              className="text-sm border border-[var(--border)] text-[var(--text-muted)] px-4 py-2 rounded-full hover:border-[var(--text)] hover:text-[var(--text)] transition-colors">
              Next →
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
