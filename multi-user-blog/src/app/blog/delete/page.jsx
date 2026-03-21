import { deletePostServerAction } from "@/app/lib/posts/deletePost";
import Form from "next/form";

export default async function DeletePost({ searchParams }) {
    const { value } = await searchParams;
    if (!value) return <p>Link is broken</p>


    return (
        <Form action={deletePostServerAction}><input type="hidden" name="post_public_id" value={value} readOnly /><button type="submit">Delete Post</button></Form>
    );
}