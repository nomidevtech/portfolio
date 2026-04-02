import { logout } from "@/app/lib/logout";
import Form from "next/form";
import Link from "next/link";

export default function NavBarClient({ isLoggedIn, username }) {
    return (
        <>
            <nav>
                {isLoggedIn && username && <p>@{username}</p>}
                <ul>
                    <li>
                        <Link href="/dashboard">Home</Link>
                    </li>
                    <li>
                        {!isLoggedIn && <Link href="/signup">Sign Up</Link>}
                    </li>
                    <li>
                        {isLoggedIn ? <Form action={logout}><button type="submit">Logout</button></Form> : <Link href="/login">Login</Link>}
                    </li>

                </ul>
            </nav>
        </>
    );
}