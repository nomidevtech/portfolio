import { Suspense } from "react";
import FavoritesServerComponent from "./FSC";

export default function Favorites() {
    
    return (
        <Suspense fallback={<p>Loading...</p>}>
            <FavoritesServerComponent />
        </Suspense>
    );
}