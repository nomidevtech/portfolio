import { Suspense } from "react";
import TaxonomiesServerComponent from "./TxSC";

export default async function Authors({ searchParams }) {
    const { value } = await searchParams;
    if (!value) return <p>Link is broken</p>

    return (
        <Suspense fallback={<p>Loading...</p>}>
            <TaxonomiesServerComponent taxonomy={value} />
        </Suspense>
    );
}