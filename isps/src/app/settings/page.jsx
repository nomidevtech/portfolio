import { redirect } from "next/navigation";
import { getUser } from "../lib/getUser";
import SettingsClient from "./ClientSettings";

export default async function Settings() {

    const currentUser = await getUser();
    if (!currentUser?.id) redirect("/login");

    const userInfo = {
        public_id: currentUser.public_id,
        username: currentUser.username,
        email: currentUser.email
    }


    return (<>
        <SettingsClient userInfo={userInfo} />
    </>);
}