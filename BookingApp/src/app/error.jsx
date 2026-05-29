"use client";

export default function GlobalError({ error, reset }) {
  return (
    <main className="page-shell-narrow">
      <p className="status-error">Something went wrong. Please try again.</p>
      <button className="btn-secondary mt-4" onClick={() => reset()}>Try again</button>
    </main>
  );
}
