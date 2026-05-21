import Link from "next/link";

export default function NotFound() {
  return (
    <main className="page-shell-narrow">
      <p className="soft-pill">404</p>
      <h1 className="mt-4 text-3xl font-black text-slate-950">Page not found</h1>
      <Link href="/" className="btn-primary mt-6 inline-flex">Go home</Link>
    </main>
  );
}
