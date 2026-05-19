import Link from "next/link";
import { getUser } from "./lib/getUser";

export default async function Home() {
  const user = await getUser();
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
      <div className="max-w-2xl">
        <p className="text-sm uppercase tracking-widest text-[var(--accent)] font-sans mb-4">Inkline</p>
        <h1 className="text-4xl sm:text-6xl font-bold text-[var(--text)] leading-tight mb-5">
          A calmer place to publish and discover writing.
        </h1>
        <p className="text-lg text-[var(--text-muted)] font-sans mb-8 max-w-xl leading-relaxed">
          Read essays, follow topics, save favorites, and keep your own posts organized in a focused multi-user blog.
        </p>
        <div className="flex gap-3 flex-wrap">
          <Link href="/blog"
            className="font-sans text-sm font-semibold bg-[var(--text)] text-[var(--bg)] px-6 py-2.5 rounded-md hover:opacity-85 transition-opacity">
            Browse posts
          </Link>
          {!user && (
            <Link href="/sign-up"
              className="font-sans text-sm font-semibold border border-[var(--border)] text-[var(--text-muted)] px-6 py-2.5 rounded-md hover:border-[var(--text)] hover:text-[var(--text)] transition-colors">
              Create account
            </Link>
          )}
          {user && (
            <Link href="/add-post"
              className="font-sans text-sm font-semibold border border-[var(--border)] text-[var(--text-muted)] px-6 py-2.5 rounded-md hover:border-[var(--text)] hover:text-[var(--text)] transition-colors">
              Write a post
            </Link>
          )}
        </div>
      </div>

      <div className="mt-16 grid gap-4 sm:grid-cols-3 font-sans">
        {[
          ["Write", "Rich posts with headings, paragraphs, images, tags, and categories."],
          ["Discuss", "Verified users can comment and authors can manage their own threads."],
          ["Save", "Favorites, personal post lists, and profile settings stay close at hand."],
        ].map(([title, copy]) => (
          <section key={title} className="border-t border-[var(--border)] pt-4">
            <h2 className="font-sans text-sm font-semibold text-[var(--text)] mb-2">{title}</h2>
            <p className="text-sm leading-relaxed text-[var(--text-muted)]">{copy}</p>
          </section>
        ))}
      </div>
    </div>
  );
}
