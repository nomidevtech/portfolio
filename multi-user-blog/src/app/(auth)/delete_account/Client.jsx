'use client';

import { deleteAccount } from "@/app/lib/deleteAccount";
import Form from "next/form";
import { useActionState, useEffect, useState } from "react";

export default function DeleteClient() {

    const initialState = { ok: null, message: "" };

    const [state, formAction, isPending] = useActionState(deleteAccount, initialState);

    const [serverMessage, setServerMessage] = useState('');

    useEffect(() => {
        if (state.ok === false) setServerMessage(state.message);
    }, [state]);


    return (
        <>
            {serverMessage && <p>{serverMessage}</p>}

            <p>This action is irreversible. You will have to create a new account to continue using our services. </p>

            <Form action={formAction}>
                <input type="text" name="password" placeholder="Enter your password" />
                <button type="submit">{isPending ? 'Deleting...' : 'Delete Account'}</button>
            </Form>
        </>
    );
}