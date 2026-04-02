import { logout } from "@/app/lib/logout";
import Form from "next/form";
import Link from "next/link";

export default function NavBarClient({ isLoggedIn, username }) {
    return (
        <header className="fixed top-0 left-0 right-0 z-40 h-14 bg-white border-b border-gray-100 flex items-center justify-between px-4">
            <Link href="/dashboard" className="text-base font-bold text-gray-900 tracking-tight">
                NetAdmin
            </Link>

            <div className="flex items-center gap-3">
                {isLoggedIn && username && (
                    <span className="hidden sm:inline text-xs font-medium text-gray-500 bg-gray-100 rounded-full px-3 py-1">
                        @{username}
                    </span>
                )}
                {isLoggedIn ? (
                    <Form action={logout}>
                        <button
                            type="submit"
                            className="text-xs font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 active:bg-gray-300 rounded-lg px-3 py-2 transition-colors"
                        >
                            Logout
                        </button>
                    </Form>
                ) : (
                    <Link
                        href="/login"
                        className="text-xs font-semibold text-white bg-gray-900 hover:bg-gray-700 rounded-lg px-3 py-2 transition-colors"
                    >
                        Login
                    </Link>
                )}
            </div>
        </header>
    );
}
