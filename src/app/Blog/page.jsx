import { db } from "../Lib/turso";
import { Suspense } from "react";
import PostTitle from "./PostTitle";
import PostTaxonomy from "./PostTaxonomy";
import PostContent from "./PostContent";
import CreatedAt from "./CreatedAt";
import PostTags from "./PostTags";
import PostAuthor from "./Auther";
import Details from "./Details";

const Blog = async () => {
  const data = await db.execute(`
    SELECT 
      posts.*,
      GROUP_CONCAT(DISTINCT tags.name) AS tag_names,
      GROUP_CONCAT(DISTINCT taxonomies.name) AS taxonomy_names
    FROM posts
    LEFT JOIN post_tags ON posts.id = post_tags.post_id
    LEFT JOIN tags ON post_tags.tag_id = tags.id
    LEFT JOIN post_taxonomies ON posts.id = post_taxonomies.post_id
    LEFT JOIN taxonomies ON post_taxonomies.taxonomy_id = taxonomies.id
    GROUP BY posts.id
    ORDER BY posts.created_at DESC
  `);

  // console.log(data.rows);





  //  console.log(content);

  return (
    <section className="bg-(--background) min-h-screen w-full py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 mt-22">
        {data.rows.map((d) => (
          <div
            key={d.id}
            className="bg-(--surface) text-(--surface-foreground) border border-gray-200 dark:border-gray-700 rounded-lg p-6 shadow hover:shadow-lg transition-shadow duration-200 flex flex-col"
          >
            <PostTitle title={d.title} />
            <PostTaxonomy taxonomy={d.taxonomy_names} />
            <PostContent content={d.content} />
            <CreatedAt created={d.created_at} />
            <PostTags tags={d.tag_names} />
            <Suspense fallback={'loading.....'}>
              <PostAuthor id={d.user_id} />
            </Suspense>

            <Details postID={d.id} />
          </div>
        ))}
      </div>
    </section>
  );
};

export default Blog;