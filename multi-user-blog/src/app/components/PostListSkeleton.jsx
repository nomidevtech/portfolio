export default function PostListSkeleton({ count = 4 }) {
  return (
    <div className="animate-pulse">
      {Array.from({ length: count }).map((_, i) => (
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
    </div>
  );
}
