import { Suspense } from "react";
import EditPostServerComponent from "./DPSC";


export default async function EditPost({ searchParams }) {

    const { value } = await searchParams;
    if (!value) return <p>Link is broken</p>

    return (<>
        <Suspense fallback={<div>Loading...</div>}>
            <EditPostServerComponent value={value} />
        </Suspense>
    </>);
}