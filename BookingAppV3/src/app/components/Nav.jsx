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

    console.log(user);


    return (<>
        <nav className="flex justify-between">
            {user ? <SideNav user={user} /> : <div></div>}

            <div>
                <ul className="border-2 border-amber-200 my-2 flex">
                    <Link href="/"><li>Home</li></Link>
                    {/* <Link href="/add-doctor"><li>Add Doctor</li></Link>
                    <Link href="/edit-doctor"><li>Edit Doctor</li></Link>
                    <Link href="/add-treatment"><li>Add Treatment</li></Link>
                    <Link href="/create-template"><li> Create Template</li></Link>
                    <Link href="/edit-template"><li> Edit Template</li></Link>
                    <Link href="/manage-generated-slots"><li> Manage Generated Slots</li></Link>
                    <Link href="/bookings"><li> Book A Slot</li></Link>
                    <Link href="/signup"><li> Sign Up</li></Link>
                    <Link href="/login"><li>Login</li></Link>
                    <Link href="/dashboard"><li>Dashboard</li></Link> */}
                </ul>
            </div>

            <div>
                {user ? <div></div> : <Link href="/login">Login</Link>}
            </div>
        </nav>
    </>);
}