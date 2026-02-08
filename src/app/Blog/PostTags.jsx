export default function PostTags({tags}){
    const tagsArr = tags.split(',');
    
    return (
        <h1>{tagsArr.map(t=>t)}</h1>
    )
}