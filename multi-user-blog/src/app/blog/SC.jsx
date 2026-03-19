import Link from "next/link";
import { getUser } from "../lib/getUser";
import { db } from "../lib/turso";
import Form from "next/form";
import AddToFavorties from "../components/AddToFavorties";


export default async function BlogServerComponent() {

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
    GROUP BY posts.id
    ORDER BY posts.created_at DESC
  `);

  const allPosts = fetchPosts.rows;
  const currentUser = await getUser();


  let favsByCurrentUser = [];

  if (currentUser?.id) {
    const result = await db.execute(`
      SELECT post_id FROM favorites WHERE user_id = ? 
    `, [currentUser.id]);

    favsByCurrentUser = result.rows.map((row) => row.post_id);
  };

  for (const post of allPosts) {
    post.isFavorited = favsByCurrentUser.includes(post.id);
  }







  console.log();

  return (
    <div>
      <h1>Blog</h1>
      <ul>
        {allPosts.map((post, idx) => (
          <div key={idx} className="border-2 m-4">
            <li key={post.id}>
              <h2>{post.title}</h2>
              <p>{post.excerpt}</p>
              <p>{post.tags}</p>
              <p>{post.taxonomy}</p>
              <p>{post.author}</p>
              <p>{post.created_at}</p>
              <Link href={`/blog/${post.slug}/${post.public_id}`}>Read more</Link>
            </li>
            {post.user_id === currentUser?.id && (
              <div>
                <Link href={`/blog/edit?value=${post.public_id}`}>Edit</Link>
                <Form>
                  <button type="submit">Delete</button>
                </Form>
              </div>
            )}
            {currentUser?.id && <AddToFavorties ppid={post.public_id} isFavorited={post.isFavorited} />}
          </div>
        ))}
      </ul>
    </div >
  );
}