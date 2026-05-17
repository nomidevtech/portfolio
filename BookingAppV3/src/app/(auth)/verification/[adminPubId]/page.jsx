import { AdminEmailVerification } from "@/app/components/emailVerification";
import { db } from "@/app/lib/turso";
import { redirect } from "next/navigation";
import { redisIpLimit } from "@/app/lib/redis";
import ClientAdminVerification from "./Client";

export default async function AdminVerification({ params }) {
  const { adminPubId } = await params;
  if (!adminPubId) return <p>Broken link</p>

  const redisLimit = await redisIpLimit(25, "verification", 60 * 15);
  if (!redisLimit.ok) return <p>{redisLimit.message}</p>

  const fetchAdmin = await db.execute(`SELECT id, status, admin_email FROM admins WHERE public_id = ?`, [adminPubId]);
  if (fetchAdmin.rows.length === 0) return <p>Broken link</p>

  if (fetchAdmin.rows[0].status === "verified") redirect("/");

  return (
    <>
      <ClientAdminVerification
        adminPubId={adminPubId}
        admin_email={fetchAdmin.rows[0].admin_email}
        status={fetchAdmin.rows[0].status}
      />
      <AdminEmailVerification adminPubId={adminPubId} />
    </>
  );
}