import { db } from "../Lib/turso";
import Link from "next/link";
import { Suspense } from "react";
import PostTitle from "./PostTitle";
import PostExcerpt from "./PostExcerpt";
import PostTaxonomy from "./PostTaxonomy";
import CreatedAt from "./CreatedAt";
import PostTags from "./PostTags";
import PostAuthor from "./Auther";
import Details from "./Details";

export default async function Blog({ searchParams }) {

  // 1) get page from url
  let page = Number(searchParams.page) || 1;

  const limit = 10;

  // 2) count total posts
  const countResult = (await db.execute(
    `SELECT COUNT(*) AS numberOfPosts FROM posts`
  )).rows[0];

  const totalPosts = countResult.numberOfPosts;
  const maxPages = Math.ceil(totalPosts / limit);

  // 3) prevent invalid page values
  if (page < 1) page = 1;
  if (page > maxPages) page = maxPages;

  const offset = (page - 1) * limit;

  // 4) fetch posts for this page ONLY
  const data = await db.execute(`
    SELECT 
      posts.*,
      users.username AS author,
      GROUP_CONCAT(DISTINCT tags.name) AS tag_names,
      GROUP_CONCAT(DISTINCT taxonomies.name) AS taxonomy_names
    FROM posts
    LEFT JOIN users ON posts.user_id = users.id
    LEFT JOIN post_tags ON post_tags.post_id = posts.id
    LEFT JOIN tags ON post_tags.tag_id = tags.id
    LEFT JOIN post_taxonomies ON post_taxonomies.post_id = posts.id
    LEFT JOIN taxonomies ON post_taxonomies.taxonomy_id = taxonomies.id
    GROUP BY posts.id
    ORDER BY posts.created_at DESC
    LIMIT ? OFFSET ?
  `, [limit, offset]);

  // 5) build nav buttons
  const maxNavBtns = 5;
  const halfOfMaxNavBtns = Math.floor(maxNavBtns / 2);

  let start = page - halfOfMaxNavBtns;
  let end = page + halfOfMaxNavBtns;

  if (start < 1) {
    start = 1;
    end = maxNavBtns;
  }

  if (end > maxPages) {
    end = maxPages;
    start = maxPages - maxNavBtns + 1;
    if (start < 1) start = 1;
  }

  const pages = Array.from({ length: end - start + 1 }, (_, i) => start + i);

  // 6) next/prev logic
  const prevPage = page > 1 ? page - 1 : 1;
  const nextPage = page < maxPages ? page + 1 : maxPages;

  return (
    <section className="bg-(--background) min-h-screen w-full py-8 px-4 sm:px-6 lg:px-8">

      <div className="max-w-7xl mx-auto grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 mt-22">
        {data.rows.map((d) => (
          <div
            key={d.id}
            className="bg-(--surface) text-(--surface-foreground) border border-gray-200 dark:border-gray-700 rounded-lg p-6 shadow hover:shadow-lg transition-shadow duration-200 flex flex-col"
          >
            <Suspense fallback={"loading....."}>
              <PostTitle title={d.title} />
              <PostTaxonomy taxonomy={d.taxonomy_names} />
              <PostExcerpt content={d.excerpt} />
              <CreatedAt created={d.created_at} />
              <PostTags tags={d.tag_names} />
              <PostAuthor Auther={d.author} />
              <Details postID={d.id} slug={d.slug} />
            </Suspense>
          </div>
        ))}
      </div>

      <div className="w-full flex justify-center gap-6 mt-20">

        {/* Prev */}
        {page > 1 && (
          <Link href={`/blog?page=${prevPage}`} className="px-4 py-2 border rounded">
            Prev
          </Link>
        )}

        {/* Number buttons */}
        {pages.map((p) => (
          <Link
            key={p}
            href={`/blog?page=${p}`}
            className={`px-4 py-2 border rounded ${p === page ? "bg-primary text-primary-foreground" : ""
              }`}
          >
            {p}
          </Link>
        ))}

        {/* Next */}
        {page < maxPages && (
          <Link href={`/blog?page=${nextPage}`} className="px-4 py-2 border rounded">
            Next
          </Link>
        )}

      </div>
    </section>
  );
}