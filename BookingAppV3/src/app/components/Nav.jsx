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

    return (
        <header className="sticky top-0 z-40 border-b border-emerald-100 bg-white/90 backdrop-blur">
            <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
                <div className="flex items-center gap-3">
                    {user ? <SideNav user={user} /> : null}
                    <Link href="/" className="flex items-center gap-2 font-bold text-slate-950">
                        <span className="grid h-9 w-9 place-items-center rounded-xl bg-teal-700 text-sm text-white">CF</span>
                        <span>ClinicFlow</span>
                    </Link>
                </div>

                <div className="hidden items-center gap-1 rounded-full border border-emerald-100 bg-emerald-50 p-1 sm:flex">
                    <Link href="/" className="rounded-full px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-white hover:text-teal-800">
                        Home
                    </Link>
                    <Link href="/bookings" className="rounded-full px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-white hover:text-teal-800">
                        Bookings
                    </Link>
                </div>

                <div className="flex items-center gap-2">
                    {user ? (
                        <span className="hidden rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600 sm:inline-flex">
                            {user.role}
                        </span>
                    ) : (
                        <Link href="/login" className="btn-secondary p-1">
                            Login
                        </Link>
                    )}
                </div>
            </nav>
        </header>
    );
}
