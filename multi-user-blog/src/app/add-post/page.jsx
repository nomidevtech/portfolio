'use client'

import Form from "next/form";
import { useState } from "react";
import { postUpsert } from "../lib/upsert";

export default function AddPost() {


    const [blocks, setBlocks] = useState([]);
    const [userTags, setUserTags] = useState([]);

    const taxonomies = ['NEXTJS', 'REACT', 'VUEJS'];
    const allTags = ['tag1', 'tag2', 'tag3'];

    return (
        <>
            <button type="button" onClick={() => setBlocks(prev => [...prev, 'heading'])}>add heading</button>
            <button type="button" onClick={() => setBlocks(prev => [...prev, 'paragraph'])}>add paragraph</button>
            <button type="button" onClick={() => setBlocks(prev => [...prev, 'image'])}>add image</button>

            <Form action={postUpsert}>
                <input name="title" type="text" placeholder="Title" />
                <textarea name="excerpt" placeholder="excerpt" />

                <input name="taxonomy" type="text" list="taxonomy" placeholder="Select Taxonomy" />
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
                        if (!allTags.includes(value)) return;
                        if (userTags.includes(value)) return;
                        setUserTags(prev => [...prev, value]);
                        e.target.value = '';
                    }}
                />

                <datalist id="tags">
                    {allTags.map((tag, idx) => <option key={idx} value={tag} />)}
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

                {blocks.map((block, index) => {
                    return (
                        <div key={index}>
                            {block === 'heading' && <input name={`heading-${index}`} type="text" placeholder="Heading" />}
                            {block === 'paragraph' && <input name={`paragraph-${index}`} type="text" placeholder="Paragraph" />}
                            {block === 'image' && <input name={`image-${index}`} type="file" />}
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
                        </div>
                    );
                })}

                <button type="submit">Submit</button>
            </Form>
        </>
    );
}