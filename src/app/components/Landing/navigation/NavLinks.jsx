import ThemeToggle from "./ThemeToggle"
import Link from "next/link"

export default function NavLinks({ menuItems, isOpen }) {
  return (
    <div className={`${isOpen ? 'block' : 'hidden'} w-full md:block md:w-auto`} id="navbar-default">
      <ul className="flex flex-col p-4 mt-4 font-medium border rounded-lg bg-surface border-surface-foreground/10 md:flex-row md:space-x-8 rtl:space-x-reverse md:mt-0 md:border-0 md:bg-transparent">

        <li>
          <Link href="/" className="block px-3 py-2 transition-colors rounded text-foreground hover:bg-surface-foreground/10 md:hover:bg-transparent md:border-0 md:hover:text-primary md:p-0">
            Home</Link>
        </li>
        <li>
          <Link href="/About" className="block px-3 py-2 transition-colors rounded text-foreground hover:bg-surface-foreground/10 md:hover:bg-transparent md:border-0 md:hover:text-primary md:p-0">
            About</Link>
        </li>
        <li>
          <Link href="/Blog" className="block px-3 py-2 transition-colors rounded text-foreground hover:bg-surface-foreground/10 md:hover:bg-transparent md:border-0 md:hover:text-primary md:p-0">
            Blog</Link>
        </li>

        <li>
          <div className="block px-3 py-2 transition-colors rounded text-foreground hover:bg-surface-foreground/10 md:hover:bg-transparent md:border-0 md:hover:text-primary md:p-0">
            <ThemeToggle isOpen={isOpen} />
          </div>
        </li>
      </ul>
    </div>
  )
}