import { PostModel } from "@/app/Models/Post";

export default async function delPost(id) {

    const postIntance = new PostModel();
    const postId = id;

    if (!id) throw new Error('id not found');


    try {
        const result = await postIntance.deleteById(id);

        return { ok: result.ok, deleted: result.deleted, message: result.message }

    } catch (error) {
        return { ok: false, deleted: false, message: error };
    }
}