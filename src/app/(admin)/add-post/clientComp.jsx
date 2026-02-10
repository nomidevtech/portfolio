"use client"

import { useState, useRef } from "react"
import { Suspense } from "react";

import { ServerAction } from "./serverAction";
import TaxonomyInput from "./TaxonomyInput";
import TagsInput from "./TagsInput";
import AddedTags from "./AddedTags";
import Message from "./Message";




export default function Client() {

    const [isSubmitted, setIsSubmitted] = useState(false)

    const [blocks, setBlocks] = useState([]);


    const [userSelectedCat, setUserSelectedCat] = useState([]);
    const [userSelectedTags, setUserSelectedTags] = useState([]);
    const [isTagExist, setIsTagExist] = useState(false);

    const titleRef = useRef(null);
    const excerptRef = useRef(null);

    const handleSubmit = async () => {
        console.log('i am working')

        const formData = new FormData();

        const serializedBlocks = blocks.map((b, i) => {

            if (b.type === 'image') {
                if (!b.file) {
                    throw new Error("Image block without file");
                }
                formData.append(`image-${i}`, b.file)

                return { type: 'image', fileKey: `image-${i}` }
            }

            return ({ type: b.type, value: b.value })
        })

        formData.append('blocks', JSON.stringify(serializedBlocks));
        formData.append('taxonomy', JSON.stringify(userSelectedCat));
        formData.append('tags', JSON.stringify(userSelectedTags));
        formData.append('title', titleRef.current.value);
        formData.append('excerpt', excerptRef.current.value)



        const data = await ServerAction(formData);
        setIsSubmitted(true)
        console.log(data);

    }

    if (!isSubmitted) {
        return (
            <section className=" flex flex-col justify-center items-center w-1/2 min-h-1/2 my-25 p-4 rounded-2xl bg-surface text-surface-foreground m-auto">
                <input type="text" placeholder="Add Title" ref={titleRef} />
                <input type="textArea" placeholder="excerpt" ref={excerptRef}/>

                <TaxonomyInput setUserSelectedCat={setUserSelectedCat} />
                <TagsInput
                    userSelectedTags={userSelectedTags}
                    setUserSelectedTags={setUserSelectedTags}
                    setTagExist={setIsTagExist}
                />

                <AddedTags
                    userSelectedTags={userSelectedTags}
                    setUserSelectedTags={setUserSelectedTags}
                />
                <Message isTagExist={isTagExist} />
                <div className="flex gap-4">
                    <button onClick={() => setBlocks(curr => [...curr, { type: 'heading', value: '' }])} className="w-30 h-10 rounded-sm bg-primary text-primary-foreground">Add Heading</button>
                    <button onClick={() => setBlocks(curr => [...curr, { type: 'paragraph', value: '' }])} className="w-30 h-10 rounded-sm bg-primary text-primary-foreground">Add Paragraph</button>
                    <button onClick={() => setBlocks(curr => [...curr, { type: 'image', file: null, }])} className="w-30 h-10 rounded-sm bg-primary text-primary-foreground">Add Image</button>
                </div>
                <div>
                    {blocks.map((block, idx) => {
                        if (block.type === 'heading') {
                            return (
                                <div key={idx}>
                                    <input
                                        type="text"
                                        placeholder="heading"
                                        value={block.value}
                                        onChange={(e) => {
                                            const blocksCopy = [...blocks];
                                            blocksCopy[idx].value = e.target.value;
                                            setBlocks(blocksCopy);
                                        }}
                                    />
                                </div>
                            );
                        }

                        if (block.type === 'paragraph') {
                            return (
                                <div key={idx}>
                                    <textarea
                                        placeholder="paragraph"
                                        value={block.value}
                                        onChange={(e) => {
                                            const blocksCopy = [...blocks];
                                            blocksCopy[idx].value = e.target.value;
                                            setBlocks(blocksCopy);
                                        }}
                                    />
                                </div>
                            );
                        }

                        if (block.type === 'image') {
                            return (
                                <div key={idx}>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => {
                                            const file = e.target.files[0];
                                            const blocksCopy = [...blocks];
                                            blocksCopy[idx].file = file;
                                            blocksCopy[idx].preview = URL.createObjectURL(file);
                                            setBlocks(blocksCopy);
                                        }}
                                    />

                                    {block.preview && (
                                        <img
                                            src={block.preview}
                                            style={{ width: "200px", marginTop: "8px" }}
                                        />
                                    )}
                                </div>
                            );
                        }

                        return null;
                    })}

                </div>
                <button onClick={() => handleSubmit()}>Submit</button>
            </section>
        )
    }
    else {
        return (
            <Suspense fallback={<div>Loading...</div>}>
                <section className=" flex flex-col justify-center items-center w-1/2 min-h-1/2 my-25 p-4 rounded-2xl bg-surface text-surface-foreground m-auto">
                    <h1>Hi</h1>
                </section>

            </Suspense>
        )
    }

}