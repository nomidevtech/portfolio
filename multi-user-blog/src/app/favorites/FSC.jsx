import { getUser } from "../lib/getUser";
import { db } from "../lib/turso";
import FavoritesClinetComponent from "./FavClient";

export default async function FavoritesServerComponent() {

  const currentUser = await getUser();
  if (!currentUser?.id) return <p>You must <a href="/login">login</a></p>

  const getPostIds = await db.execute(`
    SELECT post_id FROM favorites WHERE user_id = ? 
  `, [currentUser.id]);

  if (getPostIds.rows.length === 0) {
    return <p>No posts added to favorites yet.</p>;
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
    <FavoritesClinetComponent postsSerialized={JSON.stringify(posts)} />
  )
}