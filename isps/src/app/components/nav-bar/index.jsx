import NavBarClient from "./Client";
import { getUser } from "@/app/lib/getUser";

export default async function NavBar() {

    const currentUser = await getUser();

    const isLoggedIn = currentUser?.id ? true : false;
    const username = currentUser?.username ? currentUser.username : null;


    return (
        <>
            <NavBarClient isLoggedIn={isLoggedIn} username={username} />
        </>
    );
}