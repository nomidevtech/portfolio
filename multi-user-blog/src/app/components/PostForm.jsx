'use client'

import { postUpsert } from "@/app/lib/posts/upsert";
import Form from "next/form";
import { useState, useEffect, useActionState } from "react";


export default function PostForm({ post = {}, taxonomies = [], tags = [] }) {

    const prevContent = [];
    post.content?.forEach(item => {
        if (item.type && item.value) return prevContent.push([item.type, item.value]);
    });


    const initialState = { ok: null, message: "" };

    const [state, formAction, isPending] = useActionState(postUpsert, initialState);
    const [blocks, setBlocks] = useState([]);
    const [userTags, setUserTags] = useState(post.tags || []);


    useEffect(() => {

        setBlocks(prevContent);
    }, []);


    return (
        <>
            <button type="button" onClick={() => setBlocks(prev => [...prev, ['heading', null]])}>add heading</button>
            <button type="button" onClick={() => setBlocks(prev => [...prev, ['paragraph', null]])}>add paragraph</button>
            <button type="button" onClick={() => setBlocks(prev => [...prev, ['image', null]])}>add image</button>

            {state.message && <p>{state.message}</p>}

            <Form action={formAction} >
                <input name="post_public_id" type="hidden" readOnly value={post.post_public_id} />
                <input name="title" type="text" placeholder="Title" defaultValue={post.title ?? ""} />
                <textarea name="excerpt" placeholder="excerpt" defaultValue={post.excerpt ?? ""} />

                <input name="taxonomy" type="text" list="taxonomy" placeholder="Select Taxonomy" defaultValue={post.taxonomy ?? ""} />
                <datalist id="taxonomy">
                    {taxonomies.map((tax, idx) => <option key={idx} value={tax} />)}
                </datalist>

                <input
                    name="tags"
                    type="text"
                    list="tags"
                    placeholder="Select Tags"
                    onKeyDown={(e) => {
                        if (e.key !== 'Enter') return;
                        e.preventDefault();
                        const value = e.target.value.trim();
                        if (!value) return;
                        if (userTags.includes(value)) return;
                        setUserTags(prev => [...prev, value]);
                        e.target.value = '';
                    }}
                    onChange={(e) => {

                        const value = e.target.value.trim();
                        if (!value) return;
                        if (!tags.includes(value)) return;
                        if (userTags.includes(value)) return;
                        setUserTags(prev => [...prev, value]);
                        e.target.value = '';
                    }}
                />

                <datalist id="tags">
                    {tags.map((tag, idx) => <option key={idx} value={tag} />)}
                </datalist>

                {userTags.map((tag, idx) =>
                    <div key={idx}>
                        <input name='tags' type="hidden" value={tag} />
                        <p>{tag}</p>
                        <button
                            type="button"
                            onClick={() => setUserTags(prev => {
                                const copy = [...prev];
                                copy.splice(idx, 1);
                                return copy;
                            })}
                        >
                            x
                        </button>

                    </div>
                )}

                {blocks.map(([key, value], index) => {
                    return (
                        <div key={index}>
                            {key === 'heading' &&
                                <>
                                    <label htmlFor={`heading-${index}`}>Heading</label>
                                    <input name={`heading-${index}`} type="text" placeholder="Heading" defaultValue={value} />
                                </>}
                            {key === 'paragraph' &&
                                <>
                                    <label htmlFor={`paragraph-${index}`}>Paragraph</label>
                                    <textarea name={`paragraph-${index}`} rows={5}
                                        placeholder="Paragraph" defaultValue={value} />
                                </>}

                            {key === 'image' &&
                                <> {value?.url ? <> <img src={value.url} alt="image" width={200} height={200} /><input name={`image-${index}`} type="hidden" value={JSON.stringify(value)} /></> : <> <input name={`image-${index}`} type="file" /> </>}

                                </>}
                            <button
                                type="button"
                                onClick={() => setBlocks(prev => {
                                    const copy = [...prev];
                                    copy.splice(index, 1);
                                    return copy;
                                })}
                            >
                                x
                            </button>
                            {value !== null && <>
                                <button type="button" onClick={() => setBlocks(prev => {
                                    const copy = [...prev];
                                    copy.splice(index, 0, ['heading', null])
                                    return copy;
                                })}>add heading----------------
                                </button>
                                <button type="button" onClick={() => setBlocks(prev => {
                                    const copy = [...prev];
                                    copy.splice(index, 0, ['paragraph', null])
                                    return copy;
                                })}>add paragraph----------------
                                </button>
                                <button type="button" onClick={() => setBlocks(prev => {
                                    const copy = [...prev];
                                    copy.splice(index, 0, ['image', null])
                                    return copy;
                                })}>add image----------------
                                </button>
                            </>}

                        </div>
                    );
                })}

                <button type="submit">
                    {post.post_public_id
                        ? (isPending ? "Updating..." : "Update")
                        : (isPending ? "Creating..." : "Create")}
                </button>
            </Form>
        </>
    );
}