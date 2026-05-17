import Client from "./Client";
import { getUser } from "@/app/lib/getUser";
import { redirect } from "next/navigation";

export const metadata = {
    title: "Login",
    description: "Sign in to manage clinic bookings, doctors, treatments, and schedules.",
};

export default async function Login() {

    const currentUser = await getUser();
    if (currentUser?.id) return redirect("/settings");

    return <Client />

}
