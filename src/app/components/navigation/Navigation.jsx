import Hamburger from "./Hamburger";
import Links from "./Links";
import Logo from "./Logo";

export default function NavBar() {

  const menuItems = ['Home', 'Contact', 'About'];

  return <>

    <nav className="bg-neutral-primary fixed w-full z-20 top-0 start-0 border-b border-default">
      <div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-4">
        <Logo />
        <Hamburger menuItems={menuItems} />
        <Links menuItems={menuItems} />
      </div>
    </nav>

  </>
}