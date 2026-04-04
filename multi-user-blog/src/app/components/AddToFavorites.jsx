'use client';
import Form from "next/form";
import { addTofavorites } from "../lib/posts/favorites";
import { useActionState, useEffect, useState } from "react";

export default function AddTofavorites({ ppid, isFavorited = false }) {
    const initialState = { ok: null, message: "", added: false, removed: false };

    const [state, formAction, isPending] = useActionState(addTofavorites, initialState);
    const [fav, setFav] = useState(isFavorited);

    useEffect(() => {
        if (state.added) setFav(true);
        if (state.removed) setFav(false);
    }, [state]);

    useEffect(() => setFav(isFavorited), [isFavorited]);

    return (
        <>
            {state.message && <p>{state.message}</p>}
            <Form action={formAction}>
                <input type="hidden" name="ppid" value={ppid} readOnly />
                <button type="submit">{fav ? "★" : "☆"}</button>
            </Form>
            {isPending && <p>wait...</p>}
        </>
    );
}