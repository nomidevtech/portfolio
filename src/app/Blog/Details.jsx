import Link from "next/link"

Link
export default function Details({ postID, slug }) {
    return (
        <div>
            <Link href={`/blog/${postID}/${slug}`} > Read More</Link>
        </div>
    )
}