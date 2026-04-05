export default function Loading() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 animate-pulse">
      <div className="mb-8 pb-4 border-b-2 border-[var(--text)]">
        <div className="h-3 bg-[var(--bg-subtle)] rounded w-12 mb-2" />
        <div className="h-7 bg-[var(--bg-subtle)] rounded w-40" />
      </div>
      {[...Array(6)].map((_, i) => (
        <div key={i} className="py-5 border-b border-[var(--border)]">
          <div className="h-5 bg-[var(--bg-subtle)] rounded w-3/4 mb-2" />
          <div className="h-3 bg-[var(--bg-subtle)] rounded w-full mb-1.5 hidden sm:block" />
          <div className="h-3 bg-[var(--bg-subtle)] rounded w-1/2 hidden sm:block mb-2" />
          <div className="flex gap-3">
            <div className="h-3 bg-[var(--bg-subtle)] rounded-full w-16" />
            <div className="h-3 bg-[var(--bg-subtle)] rounded-full w-20" />
          </div>
        </div>
      ))}
      <span className="sr-only">Loading...</span>
    </div>
  );
}
