'use client'

import { useState } from "react";
import { categoryData } from "@/app/Lib/data"

export default function TaxonomyInput({ setCatExist, userSelectedCat, setUserSelectedCat }) {

  const [inputValue, setInputValue] = useState("");

  const hanldeOnClick = (e) => {
    e.preventDefault();

    const value = inputValue.trim();

    if (!value) return;

    if (userSelectedCat.includes(value)) {
      setCatExist(true);
      setInputValue('');
      return;
    }
    setUserSelectedCat(current => [value, ...current]);
    setCatExist(false);
    setInputValue("");
  }


  return (
    <div className=" flex justify-between  w-full border p-2 rounded-sm ">

      <input className="  w-[30%] focus:outline-none "
        type="text"
        list="categories"
        placeholder="Select Categories"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
      />
      <datalist id="categories">
        {categoryData.map(c => <option key={c} value={c}>{c}</option>)}
      </datalist>
      <button onClick={hanldeOnClick} className=" bg-secondary text-secondary-foreground hover:bg-primary hover:text-primary-foreground w-[15%] rounded-2xl">Add</button>



    </div>
  )
}
