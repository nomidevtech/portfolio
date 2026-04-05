"use client"
export default function Error({ error, reset }) {
  return (
    <div className="max-w-lg mx-auto px-4 py-16 text-center">
      <p className="text-2xl mb-3">⚠</p>
      <p className="font-bold text-[var(--text)] mb-1">Upload failed</p>
      <p className="font-sans text-sm text-[var(--text-muted)] mb-6">{error?.message || "The file may not be a valid image."}</p>
      <button onClick={reset} className="font-sans font-semibold bg-[var(--text)] text-[var(--bg)] px-5 py-2 rounded-full text-sm hover:opacity-80 transition-opacity cursor-pointer">Try again</button>
    </div>
  );
}
