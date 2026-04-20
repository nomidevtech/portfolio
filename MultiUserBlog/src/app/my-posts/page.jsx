import Link from "next/link";
import { getUser } from "../lib/getUser";
import { db } from "../lib/turso";
import PostCard from "../components/PostCard";

export default async function MyPosts() {
  const currentUser = await getUser();
  if (!currentUser?.id) return (
    <div className="max-w-3xl mx-auto px-4 py-16">
      <p className="font-sans text-[var(--text-muted)]">You must <Link href="/login" className="underline underline-offset-4 hover:text-[var(--accent)] transition-colors">login</Link> to view your posts.</p>
    </div>
  );
  const fetchPosts = await db.execute(`
    SELECT posts.*, taxonomies.name as taxonomy, GROUP_CONCAT(DISTINCT tags.name) as tags,
    users.username as author, users.public_id as author_public_id
    FROM posts LEFT JOIN post_taxonomies ON posts.id = post_taxonomies.post_id
    LEFT JOIN taxonomies ON post_taxonomies.taxonomy_id = taxonomies.id
    LEFT JOIN post_tags ON posts.id = post_tags.post_id
    LEFT JOIN tags ON post_tags.tag_id = tags.id
    LEFT JOIN users ON posts.user_id = users.id
    WHERE posts.user_id = ? GROUP BY posts.id
  `, [currentUser?.id]);
  if (!fetchPosts?.rows?.length) return (
    <div className="max-w-3xl mx-auto px-4 py-16 text-center">
      <p className="font-sans text-[var(--text-muted)] mb-4">You have not written any posts yet.</p>
      <Link href="/add-post" className="font-sans font-semibold bg-[var(--text)] text-[var(--bg)] px-5 py-2 rounded-full text-sm hover:opacity-80 transition-opacity">Write your first post</Link>
    </div>
  );
  const posts = fetchPosts.rows;
  const fetchFavs = await db.execute("SELECT post_id FROM favorites WHERE user_id = ?", [currentUser.id]);
  const favIds = fetchFavs.rows?.length > 0 ? fetchFavs.rows.map(r => r.post_id) : [];
  for (const p of posts) p.isFavorited = favIds.includes(p.id);
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-center justify-between mb-8 pb-4 border-b-2 border-[var(--text)]">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text)]">My Posts</h1>
          <p className="font-sans text-sm text-[var(--text-faint)] mt-0.5">{posts.length} article{posts.length !== 1 ? "s" : ""}</p>
        </div>
        <Link href="/add-post" className="font-sans font-semibold bg-[var(--text)] text-[var(--bg)] px-5 py-2 rounded-full text-sm hover:opacity-80 transition-opacity">+ New Post</Link>
      </div>
      {posts.map((post, i) => <PostCard key={i} post={post} currentUser={currentUser} />)}
    </div>
  );
}
