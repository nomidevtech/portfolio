
import { redirect } from "next/navigation";
import SettingsForm from "./Client";
import { getUser } from "../lib/getUser";

export default async function SettingsPage() {
    const result = await getUser();

    if (!result?.id) redirect("/login");

    const user = {
        public_id: result.public_id,
        name: result.name,
        username: result.username,
        email: result.email,
        role: result.role,
        email_verified: result.email_verified
    };



    return (
        <div style={{ maxWidth: "600px", margin: "40px auto", padding: "0 24px" }}>
            <h1 style={{ marginBottom: "32px", color: "#e2e8f0" }}>Settings</h1>
            <SettingsForm serializedUser={JSON.stringify(user)} />
        </div>
    );
}