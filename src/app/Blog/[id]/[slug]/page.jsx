
import PostTitle from "./PostTitle";
import PostTaxonomy from "./PostTaxonomy";
import PostContent from "./PostContent";
import CreatedAt from "./CreatedAt";
import PostTags from "./PostTags";
import PostAuthor from "./Auther";
import { db } from "@/app/Lib/turso";
import Link from "next/link";

import ClientDelete from "./client";
import getSession from "@/app/Lib/getSession";
import getUser from "@/app/Lib/getUser";
import { notFound } from "next/navigation";


export default async function DynamicPost({ params }) {
    const { id, slug } = await params;

    // console.log('i am id--------------------->', id)

    // fetch post

    const result = await db.execute(`
    SELECT
        posts.*,
        users.username AS author_name,
        taxonomies.name AS taxonomy_name,
        GROUP_CONCAT(DISTINCT tags.name) AS tag_names
    FROM posts
    LEFT JOIN users ON posts.user_id = users.id
    LEFT JOIN post_taxonomies ON post_taxonomies.post_id = posts.id
    LEFT JOIN taxonomies ON post_taxonomies.taxonomy_id = taxonomies.id
    LEFT JOIN post_tags ON post_tags.post_id = posts.id
    LEFT JOIN tags ON post_tags.tag_id = tags.id
    WHERE posts.id = ?
    GROUP BY posts.id
`, [id]);

    const postData = result.rows[0];
    if (!postData) return notFound();
    //console.log(postData);



    const isSlugMatch = postData.slug === slug;
    if (!isSlugMatch) return <div>Slug does not match</div>;

    const sessionRes = await getSession();
    const userRes = await getUser(sessionRes.session?.user_id);
    const isAdmin = sessionRes?.ok && userRes.user?.role === 'admin' || false;




    return (
        <div className="flex flex-col justify-center items-center w-1/2 min-h-1/2 my-25 p-4 rounded-2xl bg-surface text-surface-foreground m-auto">

            <div

                className="bg-(--surface) text-(--surface-foreground) border border-gray-200 dark:border-gray-700 rounded-lg p-6 shadow hover:shadow-lg transition-shadow duration-200 flex flex-col"
            >
                <PostTitle title={postData.title} />
                <PostTaxonomy taxonomy={postData.taxonomy_name} />
                <PostContent content={postData.content} />
                <CreatedAt created={postData.created_at} />
                <PostTags tags={postData.tag_names} />

                <PostAuthor auther={postData.author_name} />

            </div>
            {isAdmin ? (
                <>
                    <Link href={`/edit-post/${id}/${slug}`}>Edit</Link>
                    <ClientDelete postId={id} />
                </>
            ) : null
            }

        </div>
    )
}