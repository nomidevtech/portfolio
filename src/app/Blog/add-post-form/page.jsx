"use client"

import { useRef, useState } from "react";

import TitleInput from "./TitleInput";
import ExcerptInput from "./ExcerptInput";
import TaxonomyInput from "./TaxonomyInput";
import SubmitButton from "./SubmitButton";
import Message from "./Message";
import AddedCategories from "./AddedCategories";
import EditorJSComp from "./EditorJS";





export default function FormPage() {

    const [userSelectedCat, setUserSelectedCat] = useState([]);
    const [isCatExist, setIsCatExist] = useState(false);

    // for Editor instance
    const editorInstance = useRef(null);
    
     
    const handleSubmit= ()=>{
        editorInstance.current.save();
        console.log(editorInstance.current ? editorInstance.current.value : 'no value yet');
    }


    return (
        <section className=" flex flex-col justify-center items-center w-1/2 min-h-1/2 my-25 p-4 rounded-2xl bg-surface text-surface-foreground m-auto">
            <form onSubmit={handleSubmit} className="flex flex-col justify-center items-center gap-7 w-full">
                <TitleInput />
                <ExcerptInput />
                <TaxonomyInput
                    setCatExist={setIsCatExist}
                    userSelectedCat={userSelectedCat}
                    setUserSelectedCat={setUserSelectedCat}
                />
                <AddedCategories
                    userSelectedCat={userSelectedCat}
                    setUserSelectedCat={setUserSelectedCat}
                />
                <Message isCatExist={isCatExist} />
                <EditorJSComp ref={editorInstance} />
                <SubmitButton/>
            </form>
        </section>
    )
}


