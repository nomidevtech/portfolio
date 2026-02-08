'use client'

import { useState } from "react";


const categoryData = ['TAG1', 'TAG2', 'TAG3'];



export default function TagsInput({ setTagExist, userSelectedTags, setUserSelectedTags }) {

  const [inputValue, setInputValue] = useState("");

  const hanldeOnClick = (e) => {
    e.preventDefault();

    const value = inputValue.trim();

    if (!value) return;

    if (userSelectedTags.includes(value)) {
      setTagExist(true);
      setInputValue('');
      return;
    }
    setUserSelectedTags(current => [value, ...current]);
    setTagExist(false);
    setInputValue("");
  }


  return (
    <div className=" flex justify-between  w-full border p-2 rounded-sm ">

      <input className="  w-[30%] focus:outline-none "
        type="text"
        list="tags"
        placeholder="Select tags"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
      />
      <datalist id="tags">
        {categoryData.map(c => <option key={c} value={c}>{c}</option>)}
      </datalist>
      <button onClick={hanldeOnClick} className=" bg-secondary text-secondary-foreground hover:bg-primary hover:text-primary-foreground w-[15%] rounded-2xl">Add</button>



    </div>
  )
}
