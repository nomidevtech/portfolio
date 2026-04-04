import Link from "next/link";
import { getUser } from "../lib/getUser";
import { db } from "../lib/turso";

import DeleteButton from "../components/DeleteBTN";
import AddTofavorites from "../components/AddToFavorites";
import { paginate } from "../utils/pagination";
import SearchBar from "./SearchBar";



export default async function Blog({ searchParams }) {

  let { page } = await searchParams;
  if (!page || page < 1) page = 1;


  const fetchTotalPosts = await db.execute(`
    SELECT COUNT(*) as total FROM posts
  `);

  if (fetchTotalPosts?.rows?.length === 0) return <p>no posts</p>

  const offset = (page - 1) * 10;

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
    GROUP BY posts.id
    ORDER BY posts.created_at DESC
    LIMIT ? OFFSET ?
  `, [10, offset]);


  const totalPosts = fetchTotalPosts.rows[0].total;
  const paginatedBtnsArr = paginate(page, totalPosts);

  const allPosts = fetchPosts.rows;
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

  for (const post of allPosts) {
    post.isFavorited = favsByCurrentUser.includes(post.id);
  }



  return (<>
    <SearchBar />
    <div>
      <ul>
        {allPosts.map((post, idx) => (
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
      {page > 1 && <Link href={`/blog?page=${page - 1}`}>Previous</Link>}
      {paginatedBtnsArr.map((btn, idx) => <Link key={idx} href={`/blog?page=${btn}`}>{btn}</Link>)}
      {page < Math.ceil(totalPosts / 10) && <Link href={`/blog?page=${page + 1}`}>Next</Link>}
    </div >
  </>);
}