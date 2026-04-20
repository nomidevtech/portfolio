export default function Loading() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 animate-pulse">
      <div className="h-4 bg-[var(--bg-subtle)] rounded w-20 mb-4" />
      <div className="h-10 bg-[var(--bg-subtle)] rounded w-4/5 mb-2" />
      <div className="h-10 bg-[var(--bg-subtle)] rounded w-3/5 mb-5" />
      <div className="flex gap-4 mb-8">
        <div className="h-3 bg-[var(--bg-subtle)] rounded-full w-24" />
        <div className="h-3 bg-[var(--bg-subtle)] rounded-full w-28" />
      </div>
      <div className="space-y-3 mb-8">
        {[...Array(6)].map((_, i) => <div key={i} className="h-4 bg-[var(--bg-subtle)] rounded" />)}
      </div>
      <span className="sr-only">Loading...</span>
    </div>
  );
}
