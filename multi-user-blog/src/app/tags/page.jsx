import { Suspense } from "react";
import TagsServerComponent from "./TSC";

export default async function Authors({ searchParams }) {
    const { value } = await searchParams;
    if (!value) return <p>Link is broken</p>

    return (
        <Suspense fallback={<p>Loading...</p>}>
            <TagsServerComponent tag={value} />
        </Suspense>
    );
}