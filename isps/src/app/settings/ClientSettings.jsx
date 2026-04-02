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
        if (stateUpdate.ok === true) {
            router.refresh();
        }
    }, [stateUpdate]);

    const handleOnchange = (e) => {
        const value = e.target.value;
        if (adminNameRef.current) clearTimeout(adminNameRef.current);
        adminNameRef.current = setTimeout(() => {
            startTransition(() => {
                actionSearch(value);
            });
        }, 600);
    };

    return (
        <>
            {stateUpdate.message && <p>{stateUpdate.message}</p>}
            {stateSearch.ok !== null && stateSearch.message && userInfo.username !== stateSearch.username && <p>{stateSearch.message}</p>}
            <Form action={actionUpdate}>
                <input type="hidden" name="public_id" value={userInfo.public_id} readOnly />
                <input type="text" name="username" defaultValue={userInfo.username} onChange={handleOnchange} />
                <input type="email" name="email" defaultValue={userInfo.email} placeholder="user@example.com" />
                <button type="button" onClick={() => setChangePass(!changePass)}>{changePass ? "Cancel" : "Change Password"}</button>
                {changePass && <input type="password" name="new_password" placeholder="new password" />}
                <input type="password" name="password" placeholder={changePass ? "old password" : "password required"} />
                <button type="submit">Update</button>
            </Form>
            <Link href="/delete_account">Delete Account</Link>
        </>
    );
}