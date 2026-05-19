const pulse = "animate-pulse";
const block = "bg-[var(--bg-subtle)] rounded";

function Bar({ className = "" }) {
  return <div className={`${block} ${className}`} />;
}

function Pill({ className = "" }) {
  return <div className={`bg-[var(--bg-subtle)] rounded-full ${className}`} />;
}

function ScreenReaderLabel() {
  return <span className="sr-only">Loading...</span>;
}

function PostRowSkeleton({ actions = false, favorite = true }) {
  return (
    <article className="py-5 border-b border-[var(--border)]">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <Bar className="h-3 w-20 mb-3" />
          <Bar className="h-5 w-4/5 mb-2" />
          <Bar className="h-3 w-full mb-1.5 hidden sm:block" />
          <Bar className="h-3 w-2/3 mb-3 hidden sm:block" />
          <div className="flex flex-wrap gap-3">
            <Pill className="h-3 w-20" />
            <Pill className="h-3 w-24" />
            <Pill className="h-3 w-14" />
          </div>
        </div>
        {favorite && <Pill className="h-8 w-8 shrink-0 mt-1" />}
      </div>
      {actions && (
        <div className="flex gap-3 mt-3">
          <Pill className="h-6 w-14" />
          <Pill className="h-6 w-16" />
        </div>
      )}
    </article>
  );
}

function TopicSkeleton({ labelWidth = "w-16", titleWidth = "w-40", rows = 5 }) {
  return (
    <div className={`max-w-3xl mx-auto px-4 sm:px-6 py-8 ${pulse}`}>
      <div className="mb-8 pb-4 border-b-2 border-[var(--text)]">
        <Bar className={`h-3 ${labelWidth} mb-2`} />
        <Bar className={`h-7 ${titleWidth} mb-2`} />
        <Pill className="h-3 w-20" />
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <PostRowSkeleton key={i} favorite={i % 2 === 0} actions={i === 1} />
      ))}
      <ScreenReaderLabel />
    </div>
  );
}

function FieldSkeleton({ area = false }) {
  return (
    <div>
      <Bar className="h-3 w-20 mb-2" />
      <Bar className={area ? "h-24 w-full rounded-lg" : "h-10 w-full rounded-lg"} />
    </div>
  );
}

export function HomeSkeleton() {
  return (
    <div className={`max-w-4xl mx-auto px-4 sm:px-6 py-16 sm:py-24 ${pulse}`}>
      <div className="max-w-2xl">
        <Bar className="h-3 w-20 mb-5" />
        <Bar className="h-11 sm:h-14 w-full mb-3" />
        <Bar className="h-11 sm:h-14 w-4/5 mb-6" />
        <Bar className="h-5 w-full mb-2" />
        <Bar className="h-5 w-3/4 mb-8" />
        <div className="flex gap-3 flex-wrap">
          <Bar className="h-10 w-32 rounded-md" />
          <Bar className="h-10 w-36 rounded-md" />
        </div>
      </div>
      <div className="mt-16 grid gap-4 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <section key={i} className="border-t border-[var(--border)] pt-4">
            <Bar className="h-4 w-20 mb-3" />
            <Bar className="h-3 w-full mb-2" />
            <Bar className="h-3 w-4/5" />
          </section>
        ))}
      </div>
      <ScreenReaderLabel />
    </div>
  );
}

export function BlogIndexSkeleton() {
  return (
    <div className={`max-w-3xl mx-auto px-4 sm:px-6 py-8 ${pulse}`}>
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-8 pb-4 border-b-2 border-[var(--text)]">
        <div>
          <Bar className="h-7 w-24 mb-2" />
          <Pill className="h-3 w-20" />
        </div>
        <Bar className="h-10 w-full sm:w-72 rounded-md" />
      </div>

      <article className="pb-8 mb-8 border-b-2 border-[var(--text)]">
        <Bar className="h-3 w-24 mb-4" />
        <Bar className="h-9 w-full mb-3" />
        <Bar className="h-9 w-3/4 mb-5" />
        <Bar className="h-4 w-full mb-2" />
        <Bar className="h-4 w-2/3 mb-5" />
        <div className="flex flex-wrap gap-4">
          <Pill className="h-4 w-20" />
          <Pill className="h-4 w-28" />
          <Pill className="h-4 w-14" />
          <Pill className="h-4 w-16" />
        </div>
      </article>

      {Array.from({ length: 4 }).map((_, i) => (
        <PostRowSkeleton key={i} favorite={i % 2 === 0} actions={i === 2} />
      ))}

      <div className="flex items-center justify-center gap-2 mt-10">
        <Bar className="h-9 w-20 rounded-md" />
        <Bar className="h-9 w-10 rounded-md" />
        <Bar className="h-9 w-10 rounded-md" />
        <Bar className="h-9 w-14 rounded-md" />
      </div>
      <ScreenReaderLabel />
    </div>
  );
}

export function FavoritesSkeleton() {
  return (
    <div className={`max-w-3xl mx-auto px-4 sm:px-6 py-8 ${pulse}`}>
      <div className="flex items-center justify-between gap-4 mb-8 pb-4 border-b-2 border-[var(--text)]">
        <div>
          <Bar className="h-7 w-32 mb-2" />
          <Pill className="h-3 w-28" />
        </div>
        <div className="flex items-center gap-1 border border-[var(--border)] rounded-md p-1">
          <Bar className="h-7 w-11 rounded-sm" />
          <Bar className="h-7 w-12 rounded-sm" />
        </div>
      </div>
      {Array.from({ length: 5 }).map((_, i) => (
        <PostRowSkeleton key={i} favorite actions={i === 0 || i === 3} />
      ))}
      <ScreenReaderLabel />
    </div>
  );
}

export function MyPostsSkeleton() {
  return (
    <div className={`max-w-3xl mx-auto px-4 sm:px-6 py-8 ${pulse}`}>
      <div className="flex items-center justify-between gap-4 mb-8 pb-4 border-b-2 border-[var(--text)]">
        <div>
          <Bar className="h-7 w-32 mb-2" />
          <Pill className="h-3 w-20" />
        </div>
        <Bar className="h-9 w-28 rounded-full" />
      </div>
      {Array.from({ length: 5 }).map((_, i) => (
        <PostRowSkeleton key={i} favorite actions />
      ))}
      <ScreenReaderLabel />
    </div>
  );
}

export function CategoryResultsSkeleton() {
  return <TopicSkeleton labelWidth="w-20" titleWidth="w-44" />;
}

export function TagResultsSkeleton() {
  return <TopicSkeleton labelWidth="w-12" titleWidth="w-28" />;
}

export function AuthorResultsSkeleton() {
  return <TopicSkeleton labelWidth="w-16" titleWidth="w-36" />;
}

export function PostEditorSkeleton() {
  return (
    <div className={`max-w-2xl mx-auto px-4 sm:px-6 py-8 ${pulse}`}>
      <div className="mb-6">
        <Bar className="h-7 w-32 mb-2" />
        <Bar className="h-4 w-80 max-w-full" />
      </div>
      <div className="space-y-5">
        <FieldSkeleton />
        <FieldSkeleton area />
        <FieldSkeleton />
        <div>
          <Bar className="h-3 w-16 mb-2" />
          <Bar className="h-10 w-full rounded-lg mb-3" />
          <div className="flex flex-wrap gap-2">
            <Pill className="h-7 w-20" />
            <Pill className="h-7 w-24" />
          </div>
        </div>
        <div>
          <Bar className="h-3 w-20 mb-2" />
          <div className="space-y-3">
            <Bar className="h-24 w-full rounded-lg" />
            <Bar className="h-36 w-full rounded-lg" />
          </div>
          <div className="flex gap-2 mt-3">
            <Pill className="h-9 w-24" />
            <Pill className="h-9 w-28" />
            <Pill className="h-9 w-24" />
          </div>
        </div>
        <Bar className="h-10 w-32 rounded-full" />
      </div>
      <ScreenReaderLabel />
    </div>
  );
}

export function ArticleDetailSkeleton() {
  return (
    <div className={`max-w-3xl mx-auto px-4 sm:px-6 py-8 ${pulse}`}>
      <header className="mb-8 pb-6 border-b border-[var(--border)]">
        <Bar className="h-3 w-24 mb-4" />
        <Bar className="h-10 w-full mb-3" />
        <Bar className="h-10 w-2/3 mb-5" />
        <div className="flex flex-wrap gap-4 mb-4">
          <Pill className="h-4 w-24" />
          <Pill className="h-4 w-28" />
          <Pill className="h-4 w-20" />
        </div>
        <div className="flex gap-3">
          <Pill className="h-4 w-14" />
          <Pill className="h-4 w-16" />
        </div>
      </header>
      <div className="mb-12 space-y-5">
        <Bar className="h-7 w-1/2" />
        <Bar className="h-4 w-full" />
        <Bar className="h-4 w-full" />
        <Bar className="h-4 w-5/6" />
        <Bar className="h-64 w-full rounded-lg my-6" />
        <Bar className="h-4 w-full" />
        <Bar className="h-4 w-4/5" />
      </div>
      <div className="border-t border-[var(--border)] pt-8">
        <Bar className="h-6 w-28 mb-4" />
        <Bar className="h-24 w-full rounded-lg mb-5" />
        <div className="space-y-4">
          <Bar className="h-16 w-full rounded-lg" />
          <Bar className="h-16 w-full rounded-lg" />
        </div>
      </div>
      <ScreenReaderLabel />
    </div>
  );
}

export function SettingsSkeleton() {
  return (
    <div className={`max-w-lg mx-auto px-4 sm:px-6 py-8 ${pulse}`}>
      <Bar className="h-7 w-28 mb-6" />
      <div className="space-y-6">
        <div className="border-b border-[var(--border)] pb-6">
          <Bar className="h-3 w-20 mb-4" />
          <div className="space-y-4">
            <FieldSkeleton />
            <FieldSkeleton />
            <FieldSkeleton />
            <Bar className="h-9 w-32 rounded-full" />
          </div>
        </div>
        <div>
          <Bar className="h-3 w-20 mb-4" />
          <div className="flex flex-col gap-3 items-start">
            <Bar className="h-9 w-24 rounded-full" />
            <Bar className="h-4 w-28" />
          </div>
        </div>
      </div>
      <ScreenReaderLabel />
    </div>
  );
}

export function AuthFormSkeleton({ mode = "login" }) {
  const fieldCount = mode === "delete" ? 1 : mode === "signup" ? 5 : 2;
  const titleWidth = mode === "delete" ? "w-36" : mode === "signup" ? "w-40" : "w-36";

  return (
    <div className={`min-h-[calc(100vh-3.5rem)] bg-[var(--bg)] flex items-center justify-center px-4 py-12 ${pulse}`}>
      <div className="w-full max-w-sm">
        {mode !== "delete" && <Bar className="h-3 w-20 mb-3" />}
        <Bar className={`h-7 ${titleWidth} mb-2`} />
        <Bar className="h-4 w-full mb-7" />
        <div className="space-y-4">
          {Array.from({ length: fieldCount }).map((_, i) => (
            <FieldSkeleton key={i} />
          ))}
          <Bar className="h-10 w-full rounded-md mt-2" />
        </div>
        <Bar className="h-4 w-44 mx-auto mt-6" />
      </div>
      <ScreenReaderLabel />
    </div>
  );
}

export function VerificationSkeleton() {
  return (
    <div className={`min-h-screen bg-[var(--bg)] flex items-center justify-center px-4 ${pulse}`}>
      <div className="w-full max-w-sm text-center">
        <Bar className="h-3 w-20 mx-auto mb-4" />
        <Bar className="h-7 w-44 mx-auto mb-3" />
        <Bar className="h-4 w-full mb-2" />
        <Bar className="h-4 w-2/3 mx-auto" />
      </div>
      <ScreenReaderLabel />
    </div>
  );
}
