
import AddTofavorites from "@/app/components/AddToFavorites";
import DeleteButton from "@/app/components/DeleteBTN";
import { getUser } from "@/app/lib/getUser";
import { db } from "@/app/lib/turso";
import Image from "next/image";
import Link from "next/link";



export default async function DynamicPost({ params }) {

    const { slug, pid } = await params;
    if (!slug || !pid) return <p>Link is broken</p>

    const currentUser = await getUser();

    const fetchPost = await db.execute(`
        SELECT 
        posts.*,
        taxonomies.name as taxonomy,
        GROUP_CONCAT(DISTINCT tags.name) as tags,
        users.name as author,
        users.public_id as author_public_id,
        users.id as user_id
        FROM posts
        LEFT JOIN post_taxonomies ON posts.id = post_taxonomies.post_id
        LEFT JOIN taxonomies ON post_taxonomies.taxonomy_id = taxonomies.id
        LEFT JOIN post_tags ON posts.id = post_tags.post_id
        LEFT JOIN tags ON post_tags.tag_id = tags.id
        LEFT JOIN users ON posts.user_id = users.id
        WHERE posts.public_id = ?
        GROUP BY posts.id
        `, [pid]);

    if (fetchPost?.rows?.length === 0) return <p>Post not found</p>

    const post = fetchPost.rows[0];
    const tags = post?.tags?.split(',').map((tag) => tag.trim()).filter(Boolean);
    const content = JSON.parse(post.content);

    let isFavorited = false;

    if (currentUser?.id) {
        const fetchFavorites = await db.execute(`SELECT * FROM favorites WHERE user_id = ? AND post_id = ?`, [currentUser?.id, post?.id]);

        isFavorited = fetchFavorites?.rows?.length > 0 ? true : false;
    }






    return (<>
        {post?.slug !== slug && <p>Conflict found. Please update title or use correct url</p>}
        {post?.title && <h1>{post.title}</h1>}
        {post?.taxonomy && <h2>{post.taxonomy}</h2>}
        {post?.tags && tags.map((tag, index) => <p key={index}>{tag}</p>)}
        {post?.author && <p>Created by:{post.author}</p>}
        {post?.created_at && <p>Created at:{post.created_at}</p>}
        {post?.updated_at !== post.created_at && <p>Updated at:{post.updated_at}</p>}
        {post?.content &&
            <div>
                {content.map((item, index) => {
                    if (item.type === "heading") return <h2 key={index}>{item.value}</h2>
                    if (item.type === "paragraph") return <p key={index}>{item.value}</p>
                    if (item.type === "image" && item.value.url) return <Image key={index} src={item.value.url ?? null} alt={`${post.slug}-image-${index}`} width={500} height={500} />
                }
                )}
            </div>
        }
        {currentUser?.id ? <AddTofavorites ppid={post.public_id} isFavorited={isFavorited} /> : <p>Login to add to favorites</p>}

        {currentUser?.id === post.user_id && <p><Link href={`/edit/${post.public_id}`}>Edit</Link></p>}
        {currentUser?.id === post.user_id && <DeleteButton publicId={post.public_id} />}

    </>);
}