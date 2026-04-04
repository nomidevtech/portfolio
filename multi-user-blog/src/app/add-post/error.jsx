// app/add-post/error.jsx
'use client'

export default function Error({ error, reset }) {
    return (
        <div>
            <p>File type might not be valid image. Select valid image. Error: {error?.message || 'Unknown error'}</p>
            <button onClick={reset}>Try again</button>
        </div>
    )
}