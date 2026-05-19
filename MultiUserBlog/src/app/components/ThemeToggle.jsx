"use client";

export default function ThemeToggle() {
  const toggle = () => {
    const root = document.documentElement;
    const next = !root.classList.contains("dark");
    root.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
  };

  return (
    <button
      onClick={toggle}
      aria-label="Toggle color theme"
      title="Toggle color theme"
      className="h-8 min-w-12 rounded-md border border-transparent px-2 font-sans text-xs font-semibold text-[var(--text-muted)] hover:border-[var(--border)] hover:bg-[var(--bg-subtle)] hover:text-[var(--text)] transition-colors cursor-pointer"
    >
      Theme
    </button>
  );
}
