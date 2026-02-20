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
import ClientDelete from "./DelClient";
import getSession from "../Lib/getSession";
import getUser from "../Lib/getUser";

export default async function Blog({ searchParams }) {

  let page = Number(searchParams.page) || 1;
  const limit = 10;


  const countResult = (await db.execute(
    `SELECT COUNT(*) AS numberOfPosts FROM posts`
  )).rows[0];

  const totalPosts = countResult.numberOfPosts;
  const maxPages = Math.ceil(totalPosts / limit);


  if (page < 1) page = 1;
  if (page > maxPages && maxPages > 0) page = maxPages;

  const offset = (page - 1) * limit;


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


  const maxNavBtns = 5;
  const half = Math.floor(maxNavBtns / 2);
  let start = page - half;
  let end = page + half;

  if (start < 1) {
    start = 1;
    end = maxNavBtns;
  }
  if (end > maxPages) {
    end = maxPages;
    start = Math.max(1, maxPages - maxNavBtns + 1);
  }
  const pages = Array.from({ length: Math.max(0, end - start + 1) }, (_, i) => start + i);

  const sessionRes = await getSession();
  const userRes = await getUser(sessionRes.session?.user_id);
  const isAdmin = sessionRes?.ok && userRes.user?.role === 'admin' || false;

  return (
    <section className="bg-(--background) min-h-screen w-full py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 mt-22">
        {data.rows.map((d) => (
          <div
            key={d.id}
            className="bg-(--surface) text-(--surface-foreground) border border-gray-200 dark:border-gray-700 rounded-lg p-6 shadow hover:shadow-lg transition-shadow duration-200 flex flex-col"
          >
            <Suspense fallback="loading.....">
              <PostTitle title={d.title} />
              <PostTaxonomy taxonomy={d.taxonomy_names} />
              <PostExcerpt content={d.excerpt} />
              <CreatedAt created={d.created_at} />
              <PostTags tags={d.tag_names} />
              <PostAuthor Auther={d.author} />
              <Details postID={d.id} slug={d.slug} />

              {/* FIX: Used boolean isAdmin check */}
              {isAdmin && (
                <div className="mt-4 flex gap-2">
                  <Link href={`/edit-post/${d.id}/${d.slug}`} className="text-blue-500 underline">Edit</Link>
                  <ClientDelete postId={d.id} />
                </div>
              )}
            </Suspense>
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className="w-full flex justify-center gap-6 mt-20">
        {page > 1 && (
          <Link href={`/blog?page=${page - 1}`} className="px-4 py-2 border rounded">Prev</Link>
        )}
        {pages.map((p) => (
          <Link
            key={p}
            href={`/blog?page=${p}`}
            className={`px-4 py-2 border rounded ${p === page ? "bg-primary text-white" : ""}`}
          >
            {p}
          </Link>
        ))}
        {page < maxPages && (
          <Link href={`/blog?page=${page + 1}`} className="px-4 py-2 border rounded">Next</Link>
        )}
      </div>
    </section>
  );
}