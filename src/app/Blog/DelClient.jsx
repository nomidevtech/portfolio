'use client'

// import delServerAction from "../Lib/delServerAction"
import { useRouter } from "next/navigation"

export default function ClientDelete({ postId }) {
    const router = useRouter();

    const handleDelete = async () => {
        const confirmed = confirm('Are you sure you want to delete this post?');

        if (confirmed) {
            // const result = await delServerAction(postId);

            if (!result.ok) {
                alert('Failed to delete: ' + (result.message || 'Unknown error'));
                return;
            }

            router.refresh();
        }
    }

    return (
        <button
            onClick={handleDelete}
            className="text-red-500 hover:text-red-700 underline"
        >
            Delete
        </button>
    )
}