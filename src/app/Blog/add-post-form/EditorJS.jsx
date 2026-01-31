'use client'

import { useEffect, useRef, forwardRef, useImperativeHandle } from 'react'

const EditorJSComp = forwardRef((_, ref) => {

    const editorInstanceRef = useRef(null);

    useEffect(() => {
        async function init() {

            // dynamic imports happens only in browser
            const EditorJS = (await import("@editorjs/editorjs")).default;
            const Header = (await import("@editorjs/header")).default;
            const Paragraph = (await import("@editorjs/paragraph")).default;





            editorInstanceRef.current = new EditorJS({

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
        init()

        return () => {
            editorInstanceRef.current?.destroy()
            editorInstanceRef.current = null;
        }


    }, [])

    // saveMethod is our custom method for parent to call and inner save is a method from EditorJS. so we wriring here since Instance closue is alive here so we passing the data in method that will pass to parent with the current closue value.
    useImperativeHandle(ref, () => {
        return { // we decalaring anyomous object since useimpartive pass this object to first parmeter which is ref right now
            save: async function saveMethod() {
                return editorIntanceRef.current?.save()
            }
        }
    })

    return (<div id='editor' className="border rounded px-4 py-4 w-full min-h-75 bg-[#E5E7EB] text-[#1F2937]"></div>)
});

export default EditorJSComp;


