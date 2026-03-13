
import { redirect } from "next/navigation";
import SettingsForm from "./Client";
import { getUser } from "../lib/getUser";

export default async function SettingsPage() {
    const result = await getUser();

    if (!result) redirect("/login");


    return (
        <div style={{ maxWidth: "600px", margin: "40px auto", padding: "0 24px" }}>
            <h1 style={{ marginBottom: "32px", color: "#e2e8f0" }}>Settings</h1>
            <SettingsForm serializedUser={JSON.stringify(result)} />
        </div>
    );
}