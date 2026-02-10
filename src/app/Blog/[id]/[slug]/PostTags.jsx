export default function PostTags({tags}){
    const tagsArr = tags.split(',');
    
    
    return (
        <h1> {tagsArr}</h1>
    )
}