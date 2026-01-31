export default function PostSubmit() {  // Here post means after

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!editorRef.block.length === 0) return;

        const dataEditor = await editorRef.current.save();

        const content = {
            editorData: dataEditor,
            title: titleRef.current.value,
            excerpt: excerptRef.current.value,
            taxonomies: userSelectedTaxo
        }

        console.log(content)



    }
    return (<></>)
}