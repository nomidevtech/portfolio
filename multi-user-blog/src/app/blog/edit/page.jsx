import { Suspense } from "react";
import DynamicPostServerComponent from "./DPSC";


export default async function DynamicPost({ searchParams }) {

    const { value } = await searchParams;
    if (!value) return <p>Link is broken</p>

    return (<>
        <Suspense fallback={<div>Loading...</div>}>
            <DynamicPostServerComponent value={value} />
        </Suspense>
    </>);
}