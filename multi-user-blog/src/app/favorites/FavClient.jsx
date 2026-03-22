'use client'
import Link from "next/link";
import DeleteButton from "../components/DeleteBTN";
import AddToFavorties from "../components/AddToFavorties";
import { useState } from "react";

export default function FavoritesClinetComponent({ postsSerialized }) {

    const [showAll, setShowAll] = useState(true);

    const posts = JSON.parse(postsSerialized);

    const filteredPosts = showAll
        ? posts
        : posts.filter(post => post.isOwned);

    const postExist = filteredPosts.length > 0;

    return (
        <>
            <h1>Favorites</h1>

            <div>
                <p>Created by :</p>
                <button onClick={() => setShowAll(false)}>me</button>
                <button onClick={() => setShowAll(true)}>all</button>
            </div>
            {!postExist && <p>No posts found.</p>}
            {filteredPosts.map((post) => (
                <div key={post.id} className="border-2 m-4">
                    <ul>
                        <li>
                            <h2>{post.title}</h2>
                            <p>{post.excerpt}</p>
                            <p>tags: {post.tags}</p>
                            <p>{post.taxonomy}</p>
                            <p>{post.author}</p>
                            <p>{post.created_at}</p>
                            <Link href={`/post/${post.slug}/${post.public_id}`}>
                                Read more
                            </Link>
                        </li>
                    </ul>

                    {post.isFavorited && (
                        <AddToFavorties
                            ppid={post.public_id}
                            isFavorited={post.isFavorited}
                        />
                    )}

                    {post.isOwned && (
                        <>
                            <Link href={`/edit?value=${post.public_id}`}>Edit</Link>
                            <DeleteButton ppid={post.public_id} />
                        </>
                    )}
                </div>
            ))}
        </>
    );
}