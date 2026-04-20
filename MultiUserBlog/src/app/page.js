import Link from "next/link";
import { getUser } from "./lib/getUser";

export default async function Home() {
  const user = await getUser();
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-20 text-center">
      <p className="text-sm uppercase tracking-widest text-[var(--accent)] font-sans mb-4">Welcome</p>
      <h1 className="text-4xl sm:text-5xl font-bold text-[var(--text)] leading-tight mb-5">
        Ideas worth reading.
      </h1>
      <p className="text-lg text-[var(--text-muted)] font-sans mb-8 max-w-xl mx-auto leading-relaxed">
        A home for long-form writing, curated ideas, and original voices.
      </p>
      <div className="flex gap-3 justify-center flex-wrap">
        <Link href="/blog"
          className="font-sans text-sm font-semibold bg-[var(--text)] text-[var(--bg)] px-6 py-2.5 rounded-full hover:opacity-80 transition-opacity">
          Browse Posts
        </Link>
        {!user && (
          <Link href="/sign-up"
            className="font-sans text-sm font-semibold border border-[var(--border)] text-[var(--text-muted)] px-6 py-2.5 rounded-full hover:border-[var(--text)] hover:text-[var(--text)] transition-colors">
            Create Account
          </Link>
        )}
        {user && (
          <Link href="/add-post"
            className="font-sans text-sm font-semibold border border-[var(--border)] text-[var(--text-muted)] px-6 py-2.5 rounded-full hover:border-[var(--text)] hover:text-[var(--text)] transition-colors">
            Write a Post
          </Link>
        )}
      </div>
    </div>
  );
}
