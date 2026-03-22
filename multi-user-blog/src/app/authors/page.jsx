import { Suspense } from "react";
import AuthersServerComponent from "./ASC";

export default async function Authors({ searchParams }) {
    const { value } = await searchParams;
    if (!value) return <p>Link is broken</p>

    console.log('author', value);

    return (
        <Suspense fallback={<p>Loading...</p>}>
            <AuthersServerComponent author={value} />
        </Suspense>
    );
}