'use client'


// import { categoryData } from "@/app/Lib/Static/data"

export default function TaxonomyInput({ setUserSelectedCat }) {





  return (
    <div className=" flex justify-between  w-full border p-2 rounded-sm ">

      <input className="  w-[30%] focus:outline-none "
        type="text"
        list="categories"
        placeholder="Select Categories"

        onChange={(e) => setUserSelectedCat(e.target.value)}
      />
      <datalist id="categories">
        {/* {categoryData.map(c => <option key={c} value={c}>{c}</option>)} */}
      </datalist>




    </div>
  )
}
