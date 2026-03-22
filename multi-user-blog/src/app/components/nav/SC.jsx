import { getUser } from "@/app/lib/getUser";
import NavBarClient from "./Client";

export default async function NavServerComponent() {
    let user = null;
    try {
        const result = await getUser();
        user = result;

    } catch (error) {
        console.error("Failed to fetch user:", error);
    }


    return < NavBarClient serializedUser={JSON.stringify(user)} />;
}