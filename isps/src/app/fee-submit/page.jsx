import { redirect } from "next/navigation";
import { getUser } from "../lib/getUser";
import MiddleClient from "./MiddleClient";

export default async function FeeSubmit() {
    const currentUser = await getUser();
    if (!currentUser?.id) redirect("/login");

    return (
        <MiddleClient />
    );
}