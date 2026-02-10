// app/login/page.jsx (or Login.jsx)
"use client";

import { useActionState } from "react";
import { userValidation } from "./loginServerAction";
import Form from 'next/form'

import FormInputs from "./FormInputs";


export default function Login() {
    const [state, formAction, isPending] = useActionState(userValidation, null);

    return (
        <section className="my-30">
            <Form className="max-w-sm mx-auto" action={formAction}>

                <FormInputs />
                <button
                    type="submit"
                    disabled={isPending}
                    className="text-white bg-primary box-border border border-transparent hover:bg-primary-hover shadow-xs font-medium leading-5 rounded-base text-sm px-4 py-2.5 focus:outline-none disabled:opacity-60 disabled:cursor-not-allowed"
                >
                    {isPending ? "Loading..." : "Login"}
                </button>

                {/* ERROR MESSAGE */}
                {state?.ok === false && (
                    <p className="mt-4 text-sm text-red-500">{state.message}</p>
                )}

                {/* SUCCESS MESSAGE */}
                {state?.ok === true && (
                    <p className="mt-4 text-sm text-green-500">{state.message}</p>
                )}
            </Form>
        </section>
    );
}