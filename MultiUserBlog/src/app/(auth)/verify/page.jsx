import { db } from "@/app/lib/turso";
import { compare } from "@/app/utils/bcrypt";

const Wrap = ({ children }) => (
  <div className="min-h-screen bg-[var(--bg)] flex items-center justify-center px-4">
    <div className="w-full max-w-sm text-center">{children}</div>
  </div>
);

export default async function Verify({ searchParams }) {
  const { token, pid } = await searchParams;
  if (!token || !pid) return <Wrap><p className="font-sans text-red-500">Verification failed. Please request a new link.</p></Wrap>;
  try {
    const userRes = await db.execute("SELECT email_verified, email_token FROM users WHERE public_id = ?", [pid]);
    const user = userRes.rows[0];
    if (!user) return <Wrap><p className="font-sans text-red-500">Invalid verification link.</p></Wrap>;
    if (user.email_verified === 1) return <Wrap><p className="font-sans text-[var(--text)]">Email already verified. You can close this window.</p></Wrap>;
    const isValid = await compare(token, user.email_token);
    if (!isValid) return <Wrap><p className="font-sans text-red-500">Invalid or expired token. Please request a new link.</p></Wrap>;
    await db.execute("UPDATE users SET email_verified = 1, email_token = NULL WHERE public_id = ?", [pid]);
    return (
      <Wrap>
        <div className="text-4xl mb-4">✓</div>
        <p className="text-xl font-bold text-[var(--text)] mb-2">Email verified!</p>
        <p className="font-sans text-sm text-[var(--text-faint)]">Your account is fully active. You can close this window.</p>
      </Wrap>
    );
  } catch (err) {
    console.error(err);
    return <Wrap><p className="font-sans text-red-500">Unexpected error. Please try again later.</p></Wrap>;
  }
}
