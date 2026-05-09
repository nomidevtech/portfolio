import Form from "next/form";
import { db } from "@/app/lib/turso";
import { compare } from "@/app/utils/bcrypt";
import { updateAdminPassword } from "./sa";

export default async function NewPassword({ params }) {
    const { recoveryToken, adminPubId } = await params;
    if (!recoveryToken || !adminPubId) return <div>Broken Link</div>;

    const fetchData = await db.execute("SELECT * FROM admins WHERE public_id = ?", [adminPubId]);
    if (fetchData.rows.length === 0) return <div>Admin not found.</div>;

    const admin = fetchData.rows[0];

    const match = await compare(recoveryToken, admin.recovery_token_hash);
    if (!match) return <div>Failed to verify. Please try again.</div>;

    return (
        <>
            <Form action={updateAdminPassword}>
                <input type="hidden" name="adminPubId" value={admin.public_id} />
                <input type="password" name="password" placeholder="Enter new password" />
                <input type="password" name="confirm_password" placeholder="Confirm password" />
                <button type="submit">Submit</button>
            </Form>
        </>
    );
}