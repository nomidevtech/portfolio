import { getUser } from "@/app/lib/getUser";
import SignUpClientComponent from "./SUCC";
import { redirect } from "next/navigation";

import { initCommentsTable, initFavoritesTable, initPostsTable, initPostTaxonomiesTable, initSessionsTable, initTagsTable, initTaxonomiesTable, initUsersTable } from "@/app/models/tablesInit";

export default async function SignUp() {

    // await initUsersTable();
    // await initTaxonomiesTable();
    // await initTagsTable();
    // await initSessionsTable();
    // await initPostsTable();
    // await initPostTaxonomiesTable();
    // await initFavoritesTable();
    // await initCommentsTable();

    const currentUser = await getUser();
    if (currentUser?.id) return redirect("/settings");


    return (
        <SignUpClientComponent />
    );
}