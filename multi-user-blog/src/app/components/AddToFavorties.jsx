'use client';
import Form from "next/form";
import { addTofavorties } from "../lib/posts/favorties";

import { useActionState, useState } from "react";

export default function AddToFavorties({ ppid, isFavorited = false }) {

    const initialState = { ok: null, message: "" };

    const [state, formAction, isPending] = useActionState(addTofavorties, initialState);

    const [fav, setFav] = useState(isFavorited);



    return (<>
        {state.message && <p>{state.message}</p>}
        <Form action={formAction}>
            <input type="hidden" name="ppid" value={ppid} readOnly />
            <button onClick={() => setFav(!fav)} type="submit">{fav ? "★" : "☆"}</button>
        </Form>
        {isPending && <p>wait...</p>}
    </>);
}