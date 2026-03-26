'use client';

import { useActionState, useEffect, useState } from "react";
import { commentsSA } from "./commentsSA";
import Form from "next/form";

export default function Comments({ commentsSerialized, isLoggedIn, postPublicId, userPublicId, isVerified }) {

    const comments = JSON.parse(commentsSerialized);

    const initialState = { ok: false, message: '', comment: null, deleted: false, cPId: null, inserted: false, updated: false };

    const [state, action, isPending] = useActionState(commentsSA, initialState);

    const [commentsState, setCommentsState] = useState(comments);

    const [isEditing, setIsEditing] = useState('');

    useEffect(() => {
        if (!state.ok) return;

        setCommentsState(prev => {
            if (state.deleted) {
                return prev.filter(c => c.cPId !== state.cPId);
            }

            const index = prev.findIndex(c => c.cPId === state.cPId);
            if (index !== -1) {
                const next = [...prev];
                next[index] = {
                    ...next[index],
                    comment: state.comment,
                    username: state.username,
                    isOwned: true
                };
                return next;
            }
            return [{
                cPId: state.cPId,
                comment: state.comment,
                username: state.username,
                isOwned: true
            }, ...prev];
        });

        setIsEditing('');
    }, [state]);

    return (
        <>
            {isLoggedIn && isVerified ?
                <Form action={action}>
                    <input type="hidden" name="post_public_id" value={postPublicId} />
                    <input type="hidden" name="user_public_id" value={userPublicId} />
                    <textarea name="comment" placeholder="Comment" />
                    <button type="submit">Add</button>
                </Form>
                : <p>Need to be logged in and verified to comment </p>}

            {commentsState.length > 0 ? commentsState.map(comment => {
                return (
                    <div key={comment.cPId} className="border-2">
                        {isEditing !== comment.cPId && <>
                            <p>{comment.username}</p>
                            <p>{comment.comment}</p>
                        </>}

                        {comment.isOwned && isEditing !== comment.cPId && <>
                            <button onClick={() => setIsEditing(comment.cPId)}>Edit</button>
                            <Form action={action}>
                                <input type="hidden" name="comment_public_id" value={comment.cPId} />
                                <input type="hidden" name="post_public_id" value={postPublicId} />
                                <input type="hidden" name="user_public_id" value={userPublicId} />
                                <button type="submit" name="delete" value="true">Delete</button>
                            </Form>
                        </>}

                        {isEditing === comment.cPId && <>
                            <Form action={action}>
                                <input type="hidden" name="comment_public_id" value={comment.cPId} />
                                <input type="hidden" name="post_public_id" value={postPublicId} />
                                <input type="hidden" name="user_public_id" value={userPublicId} />
                                <textarea name="comment" defaultValue={comment.comment} />
                                <button type="submit">Update</button>
                            </Form>

                            <Form action={action}>
                                <input type="hidden" name="comment_public_id" value={comment.cPId} />
                                <input type="hidden" name="post_public_id" value={postPublicId} />
                                <input type="hidden" name="user_public_id" value={userPublicId} />
                                <button type="submit" name="delete" value="true">Delete</button>
                            </Form>
                        </>}
                    </div>
                )
            }) : <p>No comments</p>}
        </>
    );
}