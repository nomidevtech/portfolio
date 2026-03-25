import Link from "next/link";
import { getUser } from "../lib/getUser";
import { db } from "../lib/turso";
import DeleteButton from "../components/DeleteBTN";
import AddTofavorites from "../components/AddToFavorites";


export default async function MyPostsServerComponent() {

  const currentUser = await getUser();
  if (!currentUser?.id) return <p>You must <a href="/login">login</a></p>

  const fetchPosts = await db.execute(`
    SELECT 
    posts.*,
    taxonomies.name as taxonomy,
    GROUP_CONCAT(DISTINCT tags.name) as tags,
    users.name as author,
    users.public_id as author_public_id
    FROM posts
    LEFT JOIN post_taxonomies ON posts.id = post_taxonomies.post_id
    LEFT JOIN taxonomies ON post_taxonomies.taxonomy_id = taxonomies.id
    LEFT JOIN post_tags ON posts.id = post_tags.post_id
    LEFT JOIN tags ON post_tags.tag_id = tags.id
    LEFT JOIN users ON posts.user_id = users.id
    WHERE posts.user_id = ?
    GROUP BY posts.id
    `, [currentUser?.id]);

  if (fetchPosts?.rows?.length === 0) return <p>You have no posts. Add one <a href="/add-post">here</a></p>

  const posts = fetchPosts.rows;

  const fetchFavs = await db.execute(`
      SELECT post_id FROM favorites WHERE user_id = ? 
    `, [currentUser.id]);

  let favsByCurrentUser = [];

  if (fetchFavs.rows?.length > 0) {
    favsByCurrentUser = fetchFavs.rows.map((row) => row.post_id);
  };


  for (const post of posts) {
    post.isFavorited = favsByCurrentUser.includes(post.id);
  }


  return (
    <div>
      <h1>My Posts</h1>
      <ul>
        {posts.map((post, idx) => (
          <div key={idx} className="border-2 m-4">
            <li key={post.id}>
              <h2>{post.title}</h2>
              <p>{post.excerpt}</p>
              {post.tags && <p>tags:{post.tags?.split(',')?.map((tag, idx) => <Link key={idx} href={`/tags?value=${tag.trim()}`}>{tag}</Link>)}</p>}
              {post.taxonomy && <Link href={`/taxonomies?value=${post.taxonomy}`}>{post.taxonomy}</Link>}
              {post.author && <Link href={`/authors?value=${post.author}`}>by:{post.author}</Link>}
              <p>{post.created_at}</p>
              <Link href={`/post/${post.slug}/${post.public_id}`}>Read more</Link>
            </li>
            {post.user_id === currentUser?.id && (
              <div>
                <Link href={`/edit?value=${post.public_id}`}>Edit</Link>
                <DeleteButton publicId={post.public_id} />
              </div>
            )}
            {currentUser?.id && <AddTofavorites ppid={post.public_id} isFavorited={post.isFavorited} />}
          </div>
        ))}
      </ul>
    </div >
  )
}