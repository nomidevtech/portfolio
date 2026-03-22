import { Suspense } from "react";
import DynamicPostServerComponent from "./DPSC";


export default async function DynamicPost({ params }) {

    const { slug, pid } = await params;
    if (!slug || !pid) return <p>Link is broken</p>



    return (
        <Suspense fallback={<div>Loading...</div>}>
            <DynamicPostServerComponent slug={slug} pid={pid} />
        </Suspense>
    );
}