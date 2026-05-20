import crypto from "crypto";

export function hashPassword(password) {
    if (!password) return "";
    const salt = crypto.randomBytes(16).toString("hex");
    const hash = crypto.scryptSync(password, salt, 64).toString("hex");
    return `${salt}:${hash}`;
}

export function verifyPassword(password, storedPassword) {
    if (!storedPassword) return false;
    if (!storedPassword.includes(":")) {
        // Fallback for legacy plaintext passwords
        return password === storedPassword;
    }
    const [salt, hash] = storedPassword.split(":");
    const verifyHash = crypto.scryptSync(password, salt, 64).toString("hex");
    return hash === verifyHash;
}
