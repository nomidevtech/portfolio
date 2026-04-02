'use client';

import Form from "next/form";
import { startTransition, useActionState, useEffect, useRef, useState } from "react";
import { checkAdminNameServerAction } from "../lib/checkAdminNameSA";
import { settingsServerAction } from "./settingsSA";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function SettingsClient({ userInfo }) {
    const [stateUpdate, actionUpdate, isPendingUpdate] = useActionState(settingsServerAction, { ok: null, message: "" });
    const [stateSearch, actionSearch, isPendingSearch] = useActionState(checkAdminNameServerAction, { ok: null, message: "" });
    const [changePass, setChangePass] = useState(false);
    const adminNameRef = useRef(null);
    const router = useRouter();

    useEffect(() => {
        if (stateUpdate.ok === true) router.refresh();
    }, [stateUpdate]);

    const handleOnchange = (e) => {
        const value = e.target.value;
        if (adminNameRef.current) clearTimeout(adminNameRef.current);
        adminNameRef.current = setTimeout(() => {
            startTransition(() => { actionSearch(value); });
        }, 600);
    };

    return (
        <div className="max-w-lg mx-auto px-4 py-6">
            <div className="mb-6">
                <h1 className="text-xl font-bold text-gray-900">Settings</h1>
                <p className="text-sm text-gray-500 mt-0.5">Manage your account details</p>
            </div>

            {stateUpdate.message && (
                <p className={`text-sm px-4 py-3 rounded-xl border mb-4 ${
                    stateUpdate.ok
                        ? "text-green-700 bg-green-50 border-green-200"
                        : "text-red-600 bg-red-50 border-red-200"
                }`}>
                    {stateUpdate.message}
                </p>
            )}

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <Form action={actionUpdate} className="flex flex-col gap-4">
                    <input type="hidden" name="public_id" value={userInfo.public_id} />

                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Username</label>
                        <input
                            type="text"
                            name="username"
                            defaultValue={userInfo.username}
                            onChange={handleOnchange}
                            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
                        />
                        {stateSearch.ok !== null && stateSearch.message && userInfo.username !== stateSearch.username && (
                            <p className={`text-xs px-3 py-2 rounded-lg border ${
                                stateSearch.ok
                                    ? "text-green-700 bg-green-50 border-green-200"
                                    : "text-red-600 bg-red-50 border-red-200"
                            }`}>
                                {stateSearch.message}
                            </p>
                        )}
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Email</label>
                        <input
                            type="email"
                            name="email"
                            defaultValue={userInfo.email}
                            placeholder="you@example.com"
                            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-400 bg-white focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
                        />
                    </div>

                    <div className="pt-1 border-t border-gray-100">
                        <button
                            type="button"
                            onClick={() => setChangePass(!changePass)}
                            className="text-sm font-semibold text-gray-600 hover:text-gray-900 transition-colors"
                        >
                            {changePass ? "✕ Cancel password change" : "Change Password"}
                        </button>
                    </div>

                    {changePass && (
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">New Password</label>
                            <input
                                type="password"
                                name="new_password"
                                placeholder="New password"
                                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-400 bg-white focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
                            />
                        </div>
                    )}

                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                            {changePass ? "Current Password" : "Password Required"}
                        </label>
                        <input
                            type="password"
                            name="password"
                            placeholder={changePass ? "Current password" : "Enter password to save"}
                            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-400 bg-white focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isPendingUpdate}
                        className="w-full bg-gray-900 text-white rounded-xl py-3 text-sm font-semibold hover:bg-gray-700 active:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                        {isPendingUpdate ? "Saving…" : "Save Changes"}
                    </button>
                </Form>
            </div>

            <div className="mt-6 bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <p className="text-sm font-semibold text-gray-900 mb-1">Danger Zone</p>
                <p className="text-xs text-gray-500 mb-4">Permanently delete your account and all data.</p>
                <Link
                    href="/delete_account"
                    className="inline-block w-full text-center border border-red-200 text-red-600 rounded-xl py-3 text-sm font-semibold hover:bg-red-50 active:bg-red-100 transition-colors"
                >
                    Delete Account
                </Link>
            </div>
        </div>
    );
}
