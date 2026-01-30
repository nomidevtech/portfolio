"use client"

import { useRef, useEffect, useState } from "react";



const categoryData = ['Nextjs', 'React', 'Logic'];

export default function Form() {

  const editorRef = useRef(null);

  const titleRef = useRef(null);
  const excerptRef = useRef(null);
  const taxonomiesRef = useRef(null);

  // this state holds the exisiting taxonomies which user selects,
  // new taxonomies will be submit along these. 
  const [userSelectedTaxo, setUserSelectedTaxo] = useState([]);

  // duplicate taxnomimy checker
  const [isTaxExist, setIsTaxExist] = useState(false);

  useEffect(() => {

    if (!editorRef.current) {
      async function initEditor() {

        // dynamic imports happens only in browser
        const EditorJS = (await import("@editorjs/editorjs")).default;
        const Header = (await import("@editorjs/header")).default;
        const Paragraph = (await import("@editorjs/paragraph")).default;



        editorRef.current = new EditorJS({

          holder: 'editor',
          placeholder: 'Start writing',
          autofocus: true,

          tools: {
            header: {
              class: Header,
              inlineToolbar: true,
              config: {
                levels: [1, 2, 3],
                defaultLevel: 2
              }
            },

            paragraph: {
              class: Paragraph,
              inlineToolbar: true,
            }
          }
        })
      }
      initEditor()
    }


    return (() => {
      if (editorRef.current) {
        editorRef.current.destroy();
        editorRef.current = null;
      }
    })

  }, [])

  const handleTaxInput = (e) => {

    if (e.key === 'Enter') {

      e.preventDefault();

      const value = taxonomiesRef.current.value;

      if (userSelectedTaxo.includes(value)) {
        setIsTaxExist(current => true);
        return
      }
      setUserSelectedTaxo(current => [value, ...current]);
      setIsTaxExist(current => false);


      taxonomiesRef.current.value = null;
      console.log(userSelectedTaxo);


    }
  }



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

  return (

    <form onSubmit={handleSubmit} className=" flex flex-col justify-center items-center gap-4 w-1/2 min-h-1/2 my-25 p-4 rounded-2xl bg-surface text-surface-foreground m-auto">
      <input className="w-full border p-2 rounded-sm " type="text" ref={titleRef} placeholder="Add Title Here" />
      <input className="w-full border p-2 rounded-sm " type="text" ref={excerptRef} placeholder="Add Short Description" />

      <input className="w-full border p-2 rounded-sm "
        type="text"
        list="categories"
        placeholder="Press Enter to Select Multiple"
        ref={taxonomiesRef}
        onKeyDown={handleTaxInput} />
      {isTaxExist ? <p>Already Selected</p> : <span>{userSelectedTaxo.map(t => <div key={t}>{t}</div>)}</span>}
      <datalist id="categories">
        {categoryData.map(c => <option key={c} value={c}>{c}</option>)}
      </datalist>
      <div id="editor" className="border rounded px-4 py-4 w-full min-h-75 bg-[#E5E7EB] text-[#1F2937]"></div>
      <button type="submit">Submit</button>
    </form>

  )







}





