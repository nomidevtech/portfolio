import { getUser } from "@/app/lib/getUser";
import { db } from "@/app/lib/turso";
import PostForm from "@/app/components/PostForm";
import Link from "next/link";



export default async function EditPost({ searchParams }) {

    const { value } = await searchParams;
    if (!value) return (
        <div className="max-w-3xl mx-auto px-4 py-16">
            <p className="font-sans text-[var(--text-muted)]">This edit link is missing a post id.</p>
        </div>
    );

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

    if (fetchPost?.rows?.length === 0) return (
        <div className="max-w-3xl mx-auto px-4 py-16">
            <p className="font-sans text-[var(--text-muted)]">Post not found.</p>
        </div>
    );

    const postAutherPublicId = fetchPost?.rows[0]?.author_public_id;
    const currentUserPublicId = fetchCurrentUser?.public_id;
    const isOwned = postAutherPublicId === currentUserPublicId;

    if (!isOwned) return (
        <div className="max-w-3xl mx-auto px-4 py-16">
            <p className="font-sans text-[var(--text-muted)]">
                You can only edit your own posts. Return to <Link href="/blog" className="underline underline-offset-4 hover:text-[var(--accent)] transition-colors">Blog</Link>.
            </p>
        </div>
    );

    const rawData = fetchPost.rows[0];
    const post = {
        post_public_id: rawData.public_id,
        title: rawData.title,
        slug: rawData.slug,
        excerpt: rawData.excerpt,
        content: JSON.parse(rawData.content),
        taxonomy: rawData.taxonomy,
        tags: rawData.tags ? rawData.tags.split(",").map((tag) => tag.trim()).filter(Boolean) : [],

    }


    return (
        <PostForm post={post} />
    );
}
