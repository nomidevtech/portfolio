import Link from "next/link";

export default function StatusPage({ type = "error", message, backHref = "/", backLabel = "Go home" }) {
    const styles = {
        error: "border-rose-200 bg-rose-50 text-rose-700",
        warning: "border-amber-200 bg-amber-50 text-amber-800",
        success: "border-emerald-200 bg-emerald-50 text-emerald-800",
    };

    return (
        <main className="page-shell-narrow flex min-h-[60vh] flex-col items-center justify-center">
            <div className={`w-full max-w-md rounded-2xl border p-6 text-center shadow-sm ${styles[type]}`}>
                <p className="text-base font-semibold">{message}</p>
                <Link href={backHref} className="btn-secondary mt-4 inline-flex px-5 py-2 text-sm">
                    {backLabel}
                </Link>
            </div>
        </main>
    );
}
