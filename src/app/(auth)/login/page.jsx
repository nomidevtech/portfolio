import getSession from "@/app/Lib/getSession";
import getUser from "@/app/Lib/getUser";
import ClientLogin from "./ClientLogin";

import ClientAdminLoggedIn from "./ClientAdminLoggedIn";



export default async function Login() {

    const session = await getSession();

    if (!session.ok) return (<ClientLogin />)

    const user = await getUser(session.session.user_id);

    if (user.ok && user.user.role === 'admin') {
        return (< ClientAdminLoggedIn username={user.user.username} />)
    }

    return <p>not autherized</p>
}