import { Suspense } from "react";
import BlogServerComponent from "./SC";
import SearchBar from "./SearchBar";


export default async function Blog({ searchParams }) {
    let { page } = await searchParams;
    if (!page || page < 1) page = 1;


    return (<>
        <h1>Blog</h1>
        <SearchBar />
        <Suspense fallback={<div>Loading...</div>}>
            <BlogServerComponent page={page} />
        </Suspense>
    </>);
}