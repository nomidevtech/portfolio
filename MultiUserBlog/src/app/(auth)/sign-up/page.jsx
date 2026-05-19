import { getUser } from "@/app/lib/getUser";
import SignUpClientComponent from "./SUCC";
import { redirect } from "next/navigation";

import { initCommentsTable, initFavoritesTable, initPostsTable, initPostTagsTable, initPostTaxonomiesTable, initSessionsTable, initTagsTable, initTaxonomiesTable, initUsersTable } from "@/app/models/tablesInit";

export default async function SignUp() {

    await initUsersTable();
    await initSessionsTable();
    await initPostsTable();
    await initTaxonomiesTable();
    await initTagsTable();
    await initPostTaxonomiesTable();
    await initPostTagsTable();
    await initFavoritesTable();
    await initCommentsTable();

    const currentUser = await getUser();
    if (currentUser?.id) return redirect("/settings");


    return (
        <SignUpClientComponent />
    );
}
