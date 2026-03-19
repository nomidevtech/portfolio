import { Suspense } from "react";
import BlogServerComponent from "./SC";


export default function Blog() {
    return (<>
        <Suspense fallback={<div>Loading...</div>}>
            <BlogServerComponent />
        </Suspense>
    </>);
}