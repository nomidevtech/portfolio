import { redirect } from "next/navigation";
import { getUser } from "../lib/getUser";
import MiddleClient from "./MiddleClient";

export const metadata = {
    title: "Collect Fees - NetAdmin",
    description: "Process monthly billing payments and generate subscriber receipts.",
};

export default async function FeeSubmit() {
    const currentUser = await getUser();
    if (!currentUser?.id) redirect("/login");

    return (
        <MiddleClient />
    );
}