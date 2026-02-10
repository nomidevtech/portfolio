import { Suspense } from "react";
import NavClient from "./navClient";
import AdminSection from "./adminSection";


export default function NavBar() {

  return (
    <header>
      <nav className="bg-neutral-primary  w-full relative z-20 max-h-1 ">
        <div className="max-w-7xl flex flex-wrap items-center justify-between mx-auto p-4">
          <NavClient />
          <Suspense fallback={'loading....'}>
            <AdminSection />
          </Suspense>
        </div>
      </nav>
    </header>
  )
}