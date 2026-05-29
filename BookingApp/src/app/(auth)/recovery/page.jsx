import { getUser } from "@/app/lib/getUser";
import ClientRecovery from "./Client";
import { redirect } from "next/navigation";

export const metadata = {
    title: "Recover Access",
    description: "Request a password recovery link for a ClinicFlow admin account.",
};

export default async function Recovery() {
    const getCurrentUser = await getUser();
    if (getCurrentUser?.id) return redirect("/settings");

    return (
        <>
            <ClientRecovery />
        </>
    );
}
