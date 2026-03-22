import { Suspense } from "react";
import MyPostsServerComponent from "./MPSC";

export default function MyPosts() {
    return (
        <Suspense fallback={<p>Loading...</p>}>
            <MyPostsServerComponent />
        </Suspense>
    );
}