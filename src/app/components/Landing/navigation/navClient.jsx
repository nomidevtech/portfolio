'use client'

import { useState } from "react";


// sub-components
import Logo from "./Logo";
import Hamburger from "./Hamburger";
import NavLinks from "./NavLinks";




export default function NavClient() {

    // const menuItems = ['Home', 'Contact', 'About'];

    const [isOpen, setIsOpen] = useState(false);

    const handleToggle = () => setIsOpen((current) => !current)
    // <nav className="bg-neutral-primary fixed w-full z-20 top-0 start-0 border-b border-default">
    return (

        <>
            <Logo />
            <Hamburger onToggle={handleToggle} isOpen={isOpen} />
            <NavLinks isOpen={isOpen} />
        </>


    )
}