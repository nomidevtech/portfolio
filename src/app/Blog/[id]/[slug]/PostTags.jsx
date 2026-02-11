export default function PostTags({ tags }) {

    const tagsArr = tags?.split(',');


    return (
        <h1> {tagsArr ? tagsArr : 'no tag'}</h1>
    )
}