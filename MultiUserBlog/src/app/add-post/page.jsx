import Link from "next/link";
import PostForm from "../components/PostForm";
import { getUser } from "../lib/getUser";
import { db } from "../lib/turso";

export default async function AddPost() {
    const currentUser = await getUser();
    if (!currentUser?.id) return <p>You must <a href="/login">login</a></p>

    if (currentUser?.email_verified === 0) return <div><p>Please verify your email first.</p><p><Link href="/settings">click here to go to Settings</Link></p></div>

    const dummyTaxonomies = ['NEXTJS', 'REACT', 'VUEJS'];
    const dummnyAllTags = ['tag1', 'tag2', 'tag3'];

    const fetchTaxonomies = await db.execute(`
        SELECT name FROM taxonomies`);

    const fetchAllTags = await db.execute(`
        SELECT name FROM tags`);

    let taxonomies = [];
    let allTags = [];

    if (fetchTaxonomies?.rows?.length > 0) taxonomies = fetchTaxonomies.rows.map((row) => row.name);
    if (fetchAllTags?.rows?.length > 0) allTags = fetchAllTags.rows.map((row) => row.name);


    return (
        <PostForm taxonomies={taxonomies} tags={allTags} />
    );
}