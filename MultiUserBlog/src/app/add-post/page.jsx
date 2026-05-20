import Link from "next/link";
import PostForm from "../components/PostForm";
import { getUser } from "../lib/getUser";
import { db } from "../lib/turso";

export const metadata = {
  title: "New Post",
  description: "Write and publish a new article or essay on Inkline.",
};

export default async function AddPost() {
    const currentUser = await getUser();
    if (!currentUser?.id) return (
        <div className="max-w-3xl mx-auto px-4 py-16">
            <p className="font-sans text-[var(--text-muted)]">
                You must <Link href="/login" className="underline underline-offset-4 hover:text-[var(--accent)] transition-colors">login</Link> to write a post.
            </p>
        </div>
    );

    if (currentUser?.email_verified === 0) return (
        <div className="max-w-3xl mx-auto px-4 py-16">
            <div className="border border-[var(--border)] bg-[var(--bg-raised)] rounded-lg p-5">
                <h1 className="text-xl font-bold text-[var(--text)] mb-2">Verify your email first</h1>
                <p className="font-sans text-sm text-[var(--text-muted)] mb-4">Verified accounts can publish posts and join the discussion.</p>
                <Link href="/settings" className="font-sans text-sm font-semibold bg-[var(--text)] text-[var(--bg)] px-4 py-2 rounded-md hover:opacity-85 transition-opacity">
                    Go to settings
                </Link>
            </div>
        </div>
    );

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
