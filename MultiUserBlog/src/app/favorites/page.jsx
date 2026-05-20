import { getUser } from "../lib/getUser";
import { db } from "../lib/turso";
import FavoritesClientComponent from "./FavClient";
import Link from "next/link";

export const metadata = {
  title: "Favorites",
  description: "Read your saved articles, essays, and stories on Inkline.",
};

export default async function Favorites() {

  const currentUser = await getUser();
  if (!currentUser?.id) return (
    <div className="max-w-3xl mx-auto px-4 py-16">
      <p className="font-sans text-[var(--text-muted)]">
        You must <Link href="/login" className="underline underline-offset-4 hover:text-[var(--accent)] transition-colors">login</Link> to view your favorites.
      </p>
    </div>
  );

  const getPostIds = await db.execute(`
    SELECT post_id FROM favorites WHERE user_id = ? 
  `, [currentUser.id]);

  if (getPostIds.rows.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16 text-center">
        <h1 className="text-2xl font-bold text-[var(--text)] mb-2">No favorites yet</h1>
        <p className="font-sans text-sm text-[var(--text-muted)] mb-5">Save posts from the blog and they will appear here.</p>
        <Link href="/blog" className="font-sans text-sm font-semibold bg-[var(--text)] text-[var(--bg)] px-5 py-2 rounded-md hover:opacity-85 transition-opacity">
          Browse posts
        </Link>
      </div>
    );
  }


  const placeholders = getPostIds.rows.map((_) => "?").join(", ");
  const idsClause = getPostIds.rows.map((row) => row.post_id);

  const fetchPosts = await db.execute(`
    SELECT
    posts.*,
    taxonomies.name as taxonomy,
    GROUP_CONCAT(DISTINCT tags.name) as tags,
    users.name as author
    FROM posts
    LEFT JOIN post_taxonomies ON posts.id = post_taxonomies.post_id
    LEFT JOIN taxonomies ON post_taxonomies.taxonomy_id = taxonomies.id
    LEFT JOIN post_tags ON posts.id = post_tags.post_id
    LEFT JOIN tags ON post_tags.tag_id = tags.id
    LEFT JOIN users ON posts.user_id = users.id
    WHERE posts.id IN (${placeholders})
    GROUP BY posts.id
    ORDER BY posts.created_at DESC
  `, [...idsClause]);


  const posts = fetchPosts.rows;

  for (const post of posts) {
    post.isFavorited = true;
    post.isOwned = false;

    if (currentUser?.id && post.user_id === currentUser?.id) {
      post.isOwned = true;
    }
  }

  return (
    <FavoritesClientComponent postsSerialized={JSON.stringify(posts)} />
  )
}
