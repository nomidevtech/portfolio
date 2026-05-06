import Link from "next/link";
import SideNav from "./SideNav";
import { getUserPlus } from "../lib/getUser";

export default async function NavBar() {

    const getCurrentUser = await getUserPlus();
    let user = null;
    if (getCurrentUser?.id) {
        user = {
            role: getCurrentUser.role,
            name: getCurrentUser.admin_details ? getCurrentUser.admin_details.admin_name : getCurrentUser.doctor_details.name
        }
    }

    return (<>
        <nav className="flex justify-between px-2 items-center">
            {user ? <SideNav user={user} /> : <div></div>}

            <div className="flex items-center gap-3">
                <ul className="border-2 border-amber-200 my-2 flex gap-2">
                    <Link href="/"><li>Home</li></Link>
                    <Link href="/about"><li>About</li></Link>
                    <Link href="/contact"><li>Contact</li></Link>
                </ul>
                <div className="bg-green-900 px-2 py-0.5 rounded">
                    <Link href="/bookings">Bookings</Link>
                </div>
            </div>

            <div>
                {user ? <div></div> : <Link href="/login">Login</Link>}
            </div>
        </nav>
    </>);
}