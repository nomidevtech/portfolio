export default function Loading() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 animate-pulse">
      <div className="flex items-start justify-between mb-8 pb-4 border-b-2 border-[var(--text)]">
        <div className="h-7 bg-[var(--bg-subtle)] rounded w-20" />
        <div className="h-8 bg-[var(--bg-subtle)] rounded-full w-48" />
      </div>
      {/* Hero skeleton */}
      <div className="pb-8 mb-8 border-b-2 border-[var(--text)]">
        <div className="h-4 bg-[var(--bg-subtle)] rounded w-20 mb-3" />
        <div className="h-9 bg-[var(--bg-subtle)] rounded w-4/5 mb-2" />
        <div className="h-9 bg-[var(--bg-subtle)] rounded w-3/5 mb-4" />
        <div className="h-4 bg-[var(--bg-subtle)] rounded w-full mb-2" />
        <div className="h-4 bg-[var(--bg-subtle)] rounded w-2/3" />
      </div>
      {/* List skeletons */}
      {[...Array(5)].map((_, i) => (
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
