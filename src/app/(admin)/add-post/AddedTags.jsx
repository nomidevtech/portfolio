
export default function AddedTags({ userSelectedTags, setUserSelectedTags }) {
    if (userSelectedTags.length === 0) return
    return (
        <div className="w-full border p-2  rounded-sm flex gap-1 ">
            {userSelectedTags.map(m => <p key={m} className=" flex gap-1 p-2 rounded-2xl bg-secondary text-secondary-foreground ">{m}</p>)}
        </div>

    )
}


