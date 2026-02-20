'use client'

import delPost from "./delServerAction"

export default function ClientDelete({ postId }) {

    console.log(postId)


    const handleDelete = async () => {
        console.log('clicked')
        const confirmed = confirm('Are you sure?');

        if (confirmed) {
            const result = await delServerAction(postId);
            if (!result.ok || !result.deleted) return <p>failed to delete</p>

        }
        return <button onClick={() => handleDelete()} >Delete</button>

    }
}
