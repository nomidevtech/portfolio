'use client'

import delServerAction from "@/app/Lib/delServerAction"

export default function ClientDelete({ postId }) {

    console.log(postId)
    

    const handleDelete = async () => {
        console.log('clicked')
        const confirmed = confirm('Are you sure?');

        if (confirmed) {
            const result = await delServerAction(postId);
            if(!result.ok) return <p>failed to delete</p>

        }
    }

    return <button onClick={() => handleDelete()}>Delete</button>
}