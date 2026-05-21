import { AdminEmailVerification } from "@/app/components/emailVerification";
import { db } from "@/app/lib/turso";
import { redirect } from "next/navigation";
import { redisIpLimit } from "@/app/lib/redis";
import ClientAdminVerification from "./Client";

export const metadata = {
  title: "Verify Clinic Email",
  description: "Verify or update the clinic admin email address.",
};

export default async function AdminVerification({ params }) {
  const { adminPubId } = await params;
  if (!adminPubId) return <main className="page-shell-narrow"><p className="status-error">Broken link.</p></main>

  const redisLimit = await redisIpLimit(25, "verification", 60 * 15);
  if (!redisLimit.ok) return <main className="page-shell-narrow"><p className="status-error">{redisLimit.message}</p></main>

  const fetchAdmin = await db.execute(`SELECT id, status, admin_email FROM admins WHERE public_id = ?`, [adminPubId]);
  if (fetchAdmin.rows.length === 0) return <main className="page-shell-narrow"><p className="status-error">Broken link.</p></main>

  if (fetchAdmin.rows[0].status === "verified") redirect("/login?verified=already");

  return (
    <main className="page-shell-narrow">
      <ClientAdminVerification
        adminPubId={adminPubId}
        admin_email={fetchAdmin.rows[0].admin_email}
        status={fetchAdmin.rows[0].status}
      />
      <AdminEmailVerification adminPubId={adminPubId} />
    </main>
  );
}
