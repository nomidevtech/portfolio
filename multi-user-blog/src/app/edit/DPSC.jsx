import { getUser } from "@/app/lib/getUser";
import { db } from "@/app/lib/turso";
import PostForm from "@/app/components/PostForm";



export default async function EditPostServerComponent({ value }) {

    const fetchCurrentUser = await getUser();
    const fetchPost = await db.execute(`
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
        WHERE posts.public_id = ?
        GROUP BY posts.id
        `, [value]);

    if (fetchPost?.rows?.length === 0) return <p>Post not found</p>

    const postAutherPublicId = fetchPost?.rows[0]?.author_public_id;
    const currentUserPublicId = fetchCurrentUser?.public_id;
    const isOwned = postAutherPublicId === currentUserPublicId;

    if (!isOwned) return <p>unauthorized Return to <a href="/blog">Blog</a></p>

    const rawData = fetchPost.rows[0];
    const post = {
        post_public_id: rawData.public_id,
        title: rawData.title,
        slug: rawData.slug,
        excerpt: rawData.excerpt,
        content: JSON.parse(rawData.content),
        taxonomy: rawData.taxonomy,
        tags: rawData.tags.split(', '),

    }


    return (
        <PostForm post={post} />
    );
}