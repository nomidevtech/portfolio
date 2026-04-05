export default function Loading() {
  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 animate-pulse">
      <div className="h-7 bg-[var(--bg-subtle)] rounded w-32 mb-8" />
      <div className="space-y-4">
        <div className="h-10 bg-[var(--bg-subtle)] rounded-lg" />
        <div className="h-20 bg-[var(--bg-subtle)] rounded-lg" />
        <div className="h-10 bg-[var(--bg-subtle)] rounded-lg" />
        <div className="h-10 bg-[var(--bg-subtle)] rounded-lg" />
        <div className="h-32 bg-[var(--bg-subtle)] rounded-lg" />
        <div className="h-10 bg-[var(--bg-subtle)] rounded-lg w-32" />
      </div>
    </div>
  );
}
