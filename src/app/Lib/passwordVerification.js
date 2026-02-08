import bcrypt from 'bcrypt';

export async function verifyPassword(enteredPassword, storedHash) {
    try {
        const isValid = await bcrypt.compare(enteredPassword, storedHash);

        return { ok: isValid, message: `${isValid ? 'password Verified' : 'password did not match'}` }

    } catch (err) {
        return { ok: false, message: err.message || "password did not match" };
    }

}