// app/add-post/error.jsx
'use client'

export default function Error({ error, reset }) {
    return (
        <div>
            <p>Something went wrong: {error?.message || 'Unknown error'}</p>
            <button onClick={reset}>Try again</button>
        </div>
    )
}