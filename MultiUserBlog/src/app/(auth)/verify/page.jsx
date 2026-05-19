import { db } from "@/app/lib/turso";
import { compare } from "@/app/utils/bcrypt";

const Wrap = ({ children }) => (
  <div className="min-h-screen bg-[var(--bg)] flex items-center justify-center px-4">
    <div className="w-full max-w-sm text-center">{children}</div>
  </div>
);

const Message = ({ tone = "default", children }) => (
  <Wrap>
    <p className={`font-sans ${tone === "error" ? "text-red-500" : "text-[var(--text)]"}`}>{children}</p>
  </Wrap>
);

export default async function Verify({ searchParams }) {
  const { token, pid } = await searchParams;
  if (!token || !pid) return <Message tone="error">Verification failed. Please request a new link.</Message>;

  let status = "verified";

  try {
    const userRes = await db.execute("SELECT email_verified, email_token FROM users WHERE public_id = ?", [pid]);
    const user = userRes.rows[0];

    if (!user) {
      status = "invalid";
    } else if (user.email_verified === 1) {
      status = "alreadyVerified";
    } else {
      const isValid = await compare(token, user.email_token);
      if (!isValid) {
        status = "expired";
      } else {
        await db.execute("UPDATE users SET email_verified = 1, email_token = NULL WHERE public_id = ?", [pid]);
      }
    }
  } catch (err) {
    console.error(err);
    status = "error";
  }

  if (status === "invalid") return <Message tone="error">Invalid verification link.</Message>;
  if (status === "alreadyVerified") return <Message>Email already verified. You can close this window.</Message>;
  if (status === "expired") return <Message tone="error">Invalid or expired token. Please request a new link.</Message>;
  if (status === "error") return <Message tone="error">Unexpected error. Please try again later.</Message>;

  return (
    <Wrap>
      <div className="font-sans text-sm font-bold uppercase tracking-widest text-[var(--accent)] mb-4">Verified</div>
      <p className="text-xl font-bold text-[var(--text)] mb-2">Email verified!</p>
      <p className="font-sans text-sm text-[var(--text-faint)]">Your account is fully active. You can close this window.</p>
    </Wrap>
  );
}
