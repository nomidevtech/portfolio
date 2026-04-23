import Link from "next/link";

export default function NavBar() {
    return (<>
        <nav>
            <ul className="border-2 border-amber-200 my-2">
                <Link href="/"><li>Home</li></Link>
                <Link href="/add-doctor"><li>Add Doctor</li></Link>
                <Link href="/add-treatment"><li>Add Treatment</li></Link>
                <Link href="/create-template"><li> Create Template</li></Link>
                <Link href="/edit-template"><li> Edit Template</li></Link>
                <Link href="/generated-slots"><li> Generated Slots</li></Link>
            </ul>
        </nav>
    </>);
}