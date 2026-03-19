import { Suspense } from "react";
import DynamicPostClinet from "./DPClient";


export default async function DynamicPost({ params }) {

    const { slug, pid } = await params;
    if (!slug || !pid) return <p>Link is broken</p>



    return (
        <Suspense fallback={<div>Loading...</div>}>
            <DynamicPostClinet slug={slug} pid={pid} />
        </Suspense>
    );
}