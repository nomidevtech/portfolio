import Link from "next/link";
import { getUser } from "../lib/getUser";
import { db } from "../lib/turso";
import DeleteButton from "../components/DeleteBTN";
import AddTofavorites from "../components/AddToFavorites";


export default async function Taxonomies({ searchParams }) {

  const { value } = await searchParams;
  if (!value) return <p>Link is broken</p>

  const fetchPosts = await db.execute(`
        SELECT
        posts.*,
        taxonomies.name as taxonomy,
        GROUP_CONCAT(DISTINCT tags.name) as tags,
        users.username as author
        FROM posts
        LEFT JOIN post_taxonomies ON posts.id = post_taxonomies.post_id
        LEFT JOIN taxonomies ON post_taxonomies.taxonomy_id = taxonomies.id
        LEFT JOIN post_tags ON posts.id = post_tags.post_id
        LEFT JOIN tags ON post_tags.tag_id = tags.id
        LEFT JOIN users ON posts.user_id = users.id
        WHERE taxonomies.name = ?
        GROUP BY posts.id
        ORDER BY posts.created_at DESC
    `, [taxonomy]);

  if (fetchPosts?.rows?.length === 0) return <p>no posts for {taxonomy}</p>

  const posts = fetchPosts.rows;

  const currentUser = await getUser();

  let favsByCurrentUser = [];

  if (currentUser?.id) {
    const result = await db.execute(`
      SELECT post_id FROM favorites WHERE user_id = ? 
    `, [currentUser.id]);
    if (result.rows?.length > 0) {
      favsByCurrentUser = result.rows.map((row) => row.post_id);
    };
  };

  if (currentUser?.id && favsByCurrentUser.length > 0) {
    for (const post of posts) {
      post.isFavorited = favsByCurrentUser.includes(post.id);
    }
  }




  return (
    <div>
      <h1>Posts by {taxonomy}</h1>
      <ul>
        {posts.map((post, idx) => (
          <div key={idx} className="border-2 m-4">
            <li key={post.id}>
              <h2>{post.title}</h2>
              <p>{post.excerpt}</p>
              {post.tags && <p>tags:{post.tags?.split(', ')?.map((tag, idx) => <Link key={idx} href={`/tags/${tag}`}>{tag}</Link>)}</p>}
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
  );
}