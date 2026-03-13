import NavBarClient from "./Client";
import { getUser } from "@/app/lib/getUser";



export default async function NavBar() {
    let user = null;
    try {
        const result = await getUser();
        user = result;

    } catch (error) {
        console.error("Failed to fetch user:", error);
    }


    return < NavBarClient serializedUser={JSON.stringify(user)} />;
}